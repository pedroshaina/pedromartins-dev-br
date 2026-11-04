---
title: Deixando o Git comandar o cluster
description: >-
  Argo CD e o padrão app-of-apps, secrets do 1Password via External Secrets Operator e as fundações
  do cluster: Cilium para rede e Proxmox CSI para armazenamento.
pubDate: 2026-11-10
project: k8s-homelab
draft: true
---

No [primeiro post](/pt-br/blog/homelab-mini-pc-to-kubernetes/), eu fui de um mini PC até um cluster
Kubernetes vazio. Agora era hora de fazer do Git a fonte da verdade para tudo que roda nele.

## GitOps: Argo CD

Eu precisava decidir qual ferramenta de GitOps gerenciaria o cluster. Existem basicamente duas
opções populares: Argo CD e Flux CD. Para mim, essa foi uma escolha fácil. Fui de Argo CD porque já
tinha usado em produção, e pela minha experiência mais empresas usam Argo do que Flux. A interface
também é um bônus legal.

Seguindo a prática comum e a documentação oficial do Argo CD, implementei o padrão
**app-of-apps**: uma aplicação `root` é deployada manualmente primeiro e, a partir dela, todas as
outras aplicações são gerenciadas, incluindo o próprio Argo CD.

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: root
  namespace: argocd
spec:
  project: platform
  source:
    repoURL: git@github.com:your-github-user/platform-gitops.git
    targetRevision: main
    path: apps # uma Application por componente fica aqui
  destination:
    server: https://kubernetes.default.svc
    namespace: argocd
  syncPolicy:
    automated:
      prune: true # removido do Git → removido do cluster
      selfHeal: true # alterado na mão → revertido
```

É essa `syncPolicy` que faz o Git sempre ganhar. Se eu removo algo do repositório, o Argo CD remove
do cluster; se eu altero algo na mão com `kubectl`, o Argo CD desfaz.

Mas a ordem importa: um `Certificate` não pode ser criado antes de o cert-manager existir. Cada
Application tem uma annotation de sync wave, e o Argo CD sincroniza as waves em ordem, da menor
para a maior:

![App of apps: a Application root observa a pasta apps, e o Argo CD sincroniza a plataforma em waves de -2 a 3](./app-of-apps.svg)

## Secrets

Com tudo isso resolvido, eu precisava de uma forma de lidar com os secrets dentro do cluster. Queria
algo seguro e com cara de produção desde o primeiro dia, então escolhi rodar o ESO (External
Secrets Operator). Como eu já tinha uma assinatura do 1Password, usei ele como backend.

Isso deixa um secret que o ESO não consegue buscar sozinho: o token que ele usa para se autenticar
no cofre do 1Password, o "secret zero". Esse fica no Git, criptografado em repouso com SOPS, e é
descriptografado e aplicado uma única vez, no bootstrap do cluster.

![Fluxo de secrets: um token criptografado com SOPS no Git permite que o External Secrets Operator leia o 1Password e crie Secrets do Kubernetes para as aplicações](./secrets.svg)

Uma aplicação nunca sabe que o 1Password existe. Ela pede um secret com um `ExternalSecret`, e o
ESO transforma isso em um `Secret` comum do Kubernetes e o atualiza a cada hora. Este é o que o
cert-manager usa para falar com a Cloudflare:

```yaml
apiVersion: external-secrets.io/v1
kind: ExternalSecret
metadata:
  name: cloudflare-api-token
  namespace: cert-manager
spec:
  refreshInterval: 1h
  secretStoreRef: { kind: ClusterSecretStore, name: platform } # o cofre da plataforma
  target:
    name: cloudflare-api-token
  data:
    - secretKey: api-token
      remoteRef:
        key: cert-manager-cloudflare-api-token/api-token # item/campo no 1Password
```

Nenhum secret em texto puro chega ao Git, e rotacionar um secret é alterá-lo no 1Password, sem
precisar commitar nada.

## As fundações

Eu já tinha juntado algumas peças do quebra-cabeça, mas ainda faltavam algumas fundamentais:

- **CNI:** rede e gerenciamento de endereços IP (IPAM) dentro do cluster
- **CSI:** armazenamento persistente para o cluster
- como expor serviços para a internet
- gerenciamento de DNS
- TLS

As duas primeiras estão logo abaixo. As outras três são todas sobre como chegar ao cluster, então
ganharam [um post só delas](/pt-br/blog/homelab-going-live/).

### Rede: Cilium

Para a rede e o IPAM do cluster, escolhi o Cilium. Ele é o padrão da indústria e faz muita coisa
com poucas peças móveis. No meu cluster, ele:

- substitui o kube-proxy por completo;
- distribui IPs de LoadBalancer na minha rede de casa e os anuncia com L2 announcements, então eu
  não preciso de MetalLB;
- implementa a Gateway API, então também não preciso de um ingress controller separado;
- vem com o Hubble, que me mostra qual pod está falando com qual.

Existe um problema de ovo e galinha: sem um CNI, o node nunca fica `Ready`, então o Argo CD não
consegue rodar para instalar um. O OpenTofu instala o Cilium quando cria o cluster, e o Argo CD
assume a partir daí, usando o mesmo arquivo de values para que os dois nunca discordem.

### Armazenamento: Proxmox CSI

O Proxmox CSI foi minha escolha de armazenamento. Ele conecta volumes do Proxmox ao cluster e os
mapeia para PersistentVolumes, o que o deixa muito parecido com uma solução gerenciada de nuvem,
como o EBS, e muito fácil de gerenciar em casa. Cada `PersistentVolumeClaim` vira um disco no NVMe:

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: proxmox-lvm
  annotations:
    storageclass.kubernetes.io/is-default-class: 'true'
provisioner: csi.proxmox.sinextra.dev
parameters:
  storage: local-lvm
  csi.storage.k8s.io/fstype: ext4
  ssd: 'true'
reclaimPolicy: Delete # aplicações que precisam manter os dados optam por Retain
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true
```

## A seguir

Nesse ponto o cluster já rodava qualquer coisa que o Git mandasse, mas só eu conseguia acessá-lo.
No último post eu abro ele para a internet, dou a ele DNS e TLS e faço o deploy da minha primeira
aplicação.
