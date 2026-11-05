---
title: Colocando um servidor SSH na internet
description: >-
  Como servir uma TUI via SSH sem expor a rede de casa nem arriscar um susto na fatura da
  nuvem: uma VM do free tier como relay, Tailscale, o que o servidor recusa, limites no HAProxy e
  um teto de egress com CAKE.
pubDate: 2026-11-05
project: cv-ssh
draft: false
---

No [post anterior](/pt-br/blog/cv-ssh-building-the-tui/), meu currículo virou uma TUI servida via
SSH, rodando na minha máquina. Agora vinha a parte interessante: fazer o deploy disso na internet.

## Tirando o SSH de dentro de casa

Desde o começo eu fiquei bem paranoico com segurança, então fui pesquisar o que podia
dar errado ao abrir isso para o público:

- **Primeiro desafio: como expor um servidor TCP na porta 22.** É o mesmo desafio que eu enfrentei
  quando fiz o deploy do yabe na internet pela primeira vez: IPs públicos atrás de CGNAT, provedores
  bloqueando port forwarding para portas abaixo de 1024 etc. Dessa vez foi ainda mais difícil,
  porque a solução que usei para o yabe, o [Cloudflare Tunnel](/pt-br/blog/homelab-going-live/), foi
  feita para tráfego HTTP. Até dá para passar SSH por ele, mas só se cada visitante instalar o `cloudflared` na
  própria máquina, e ninguém vai fazer isso para ler um currículo.
- Além disso, sem o Cloudflare Tunnel eu ia ter que apontar o domínio para o IP público da
  minha casa para as pessoas conseguirem acessar.
- Eu também ia perder vários recursos de segurança que já vêm prontos com a Cloudflare: WAF, rate
  limiting etc.

Eu sabia que não queria sair distribuindo meu IP público por aí, então comecei a procurar
alternativas. Basicamente, a única opção realista que mantinha o custo abaixo de US$10/mês
(eu não queria gastar mais que isso num projeto pessoal) era alugar uma VPS e usar ela
como relay entre a rede de casa e a internet. E foi isso que eu fiz.

Fui atrás da solução mais barata que eu conseguisse achar e acabei optando pelo GCP: o free tier
inclui uma instância `e2-micro` com 1 GB de tráfego de egress por mês, o que é mais do que suficiente
para mandar o texto de um currículo pela rede. Só que o IP público estático não é de graça: custa
uns US$3,65/mês.

Então o setup completo fica mais ou menos assim:

```
SSH do usuário -> VM no GCP -> Tailscale -> Meu homelab
```

Isso resolve a parte do IP público, já que meu registro DNS agora aponta para o IP público do GCP, e
quem cuida da conexão privada entre o GCP e a rede de casa é o Tailscale. As duas pontas só abrem
conexões de saída para o Tailscale, então continuo sem nenhuma porta aberta em casa.

## O que podia dar errado

Mas ainda tinha muita coisa que podia dar errado. Minhas principais preocupações eram:

- Eu não queria que o servidor SSH virasse uma porta de entrada para atacar a rede ou os
  dispositivos do meu homelab
- Eu não queria levar um susto com uma conta gigante do GCP do nada porque alguém resolveu apontar
  uma botnet para o meu domínio

Então fui atrás de como mitigar esses riscos.

### O servidor SSH

Primeiro, descobri que o ssh2 nunca entrega um shell para a conexão: não tem shell nenhum por trás
do servidor, só a aplicação do currículo, o que já reduz bastante a superfície de ataque. Depois,
decidi limitar o que o cliente SSH podia pedir ao servidor. Desativei port forwarding, SFTP e
praticamente qualquer outro pedido que um cliente pode mandar para um servidor SSH. Se alguém
tenta rodar um comando, recebe uma recusa de uma linha; tentativas de forwarding eu rejeito e
registro no log, já que um visitante normal nunca faz isso:

```ts
session.on('exec', (accept, _reject, execInfo) => {
  connectionLogger.info({ command: execInfo.command }, 'exec refused');
  refuseChannel(accept(), REFUSAL_MESSAGES['commands-unsupported']);
});

// Com forwarding, o servidor virava um proxy para a rede interna.
client.on('tcpip', (_accept, reject, { destIP, destPort }) => {
  connectionLogger.warn(
    { kind: 'direct-tcpip', dest: `${destIP}:${destPort}` },
    'forwarding refused',
  );
  reject();
});
```

Ainda assim, eu me preocupava com DDoS e com gente sequestrando os recursos da máquina, então
implementei mais algumas coisas: um limite de sessões abertas ao mesmo tempo (20), um limite por IP
(2 sessões por endereço) e dois timeouts: 30 segundos entre conectar e o currículo aparecer na
tela, e 180 segundos sem apertar nenhuma tecla.

### O edge

Mas isso cobre só o servidor SSH e o lado do homelab. Se você lembrar do fluxo da conexão lá
em cima, ainda tem a porta de entrada no GCP, e como o GCP cobra pelo tráfego de egress, isso também
precisava de proteção.

Para o edge no GCP, decidi manter as coisas simples. A VM já rodava o HAProxy para repassar o IP
real dos clientes para o servidor SSH (num header do PROXY protocol) por causa do limite por IP,
então foi natural usar o HAProxy para aplicar limites por IP no edge público também:

```
frontend ssh
  bind :22
  maxconn 25
  # Por IP de visitante: no máximo 3 conexões abertas e 10 novas a cada 10 s
  stick-table type ip size 10k expire 60s store conn_cur,conn_rate(10s)
  tcp-request connection track-sc0 src
  tcp-request connection reject if { sc_conn_cur(0) gt 3 }
  tcp-request connection reject if { sc_conn_rate(0) gt 10 }
  default_backend cv_ssh

backend cv_ssh
  server cv-ssh cv-ssh.<tailnet>:22 send-proxy-v2
```

Depois usei o CAKE como traffic shaper para limitar tudo o que a VM envia a 128 kbit/s. É um único
comando `tc`, rodado no boot:

```
tc qdisc replace dev ens4 root cake bandwidth 128kbit
```

Isso limita quanto tráfego de egress a VM consegue servir num certo período de tempo, e no meu
setup faz duas coisas:

- Se alguém resolver bombardear o servidor com requisições, o edge fica mais lento para todo mundo
  em vez de mandar mais dados. O CAKE organiza a fila por fluxo, então uma sessão normal continua
  usável mesmo ao lado de uma pesada.
- Coloca um teto no quanto uma botnet conseguiria somar na minha conta do GCP. Rodando no limite o
  mês inteiro, 128 kbit/s dá uns 42 GB, ou mais ou menos US$4,90 de egress. Somando com o custo do IP estático, no pior cenário,
  fica em mais ou menos US$8,55/mês, ainda abaixo do meu orçamento de US$10/mês.

## Um terminal no navegador

Agora estava tudo no ar e funcionando liso. Fiquei muito empolgado por finalmente ter
terminado! Só que eu ainda sentia que faltava alguma coisa. Era legal saber que funcionava e poder
falar sobre isso, mas era bem difícil mostrar para as pessoas: elas precisariam de um terminal em mãos
e de uma noção básica de como se conectar a servidores SSH. Mesmo que a ideia inicial fosse voltada para um
público técnico, eu sentia que dava para oferecer algo mais fácil para quem não é da área. Então
comecei a pensar em construir uma UI para isso.

Eu queria que a experiência fosse parecida com abrir uma janela de terminal e conectar de verdade no
servidor SSH, então configurei um servidor HTTP na mesma aplicação Node.js que já rodava o servidor
SSH e comecei a fazer um brainstorming da solução com o Claude.

O resultado? [cv-ssh.pedromartins.dev.br](https://cv-ssh.pedromartins.dev.br)! Uma página web que
renderiza uma janela com cara de terminal, mostra uma animação de `ssh cv.pedromartins.dev.br` sendo
digitado e imita o visual e a navegação da TUI.

## Juntando tudo

Este é o caminho que o `ssh` de um visitante percorre, com todos os limites no meio do trajeto:

![A conexão SSH de um visitante chega no HAProxy de uma VM no GCP, que aplica limites por IP e controla com o CAKE tudo o que a VM envia, e depois atravessa o Tailscale até o servidor cv-ssh no meu homelab, que limita as sessões, recusa tudo que não seja o currículo e renderiza o currículo com o Ink](./request-path.pt-br.svg)

E assim termina a história: da inspiração no terminal.shop ao deploy da minha própria TUI
via SSH! Se você quiser entender melhor como isso funciona e construir a sua, dá uma
olhada no [repositório público do projeto no GitHub](https://github.com/pedroshaina/cv-ssh), ou
teste você mesmo:

```
ssh cv.pedromartins.dev.br
```
