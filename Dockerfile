FROM node:24.22.0-alpine@sha256:44fce696f38ba8c987c4db89954051000bbd05ffd8d8659ba15ed4a8602e937f AS build
WORKDIR /src
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# Runtime: nginx only, as UID 101, on a read-only root filesystem with /tmp as the one writable path.
FROM nginxinc/nginx-unprivileged:1.30.6-alpine@sha256:782bb89768cc87b7f95c18b95baa1af250e5d451f26794f59363540161147c01
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /src/dist /usr/share/nginx/html
USER 101
EXPOSE 8080
# The image's entrypoint scripts rewrite files under /etc/nginx, which fails on a read-only filesystem.
ENTRYPOINT []
CMD ["nginx", "-g", "daemon off;"]
