FROM alpine:3.21
LABEL maintainer="hcornet@tips-of-mine.fr"

# Install required packages
RUN apk --update add openssl nginx php83 php83-fpm php83-json php83-openssl nodejs npm

ENV ROOT_DOMAIN="root.domain"
ENV OCSP_URL="http://127.0.0.1:2560"
ENV SAN="DNS:certs.$ROOT_DOMAIN"

# Create directories
RUN mkdir -p /root/scripts
RUN mkdir -p /var/www/html

# TLS Setup
COPY /src/setup-tls-folder.sh /root/scripts/setup-tls-folder.sh
RUN chmod +x /root/scripts/setup-tls-folder.sh
RUN /root/scripts/setup-tls-folder.sh

COPY src/create_chain.sh /root/scripts/create_chain.sh
COPY src/create_cert.sh /root/scripts/create_cert.sh
COPY src/create_san_wildcard_cert.sh /root/scripts/create_san_wildcard_cert.sh
COPY src/revoke_cert.sh /root/scripts/revoke_cert.sh
COPY src/get_chain.sh /root/scripts/get_chain.sh
COPY src/get_cert.sh /root/scripts/get_cert.sh
COPY src/get_key.sh /root/scripts/get_key.sh
COPY src/configs/root-openssl.conf /root/tls/openssl.cnf
COPY src/configs/intermediate-openssl.conf /root/tls/intermediate/openssl.cnf

RUN chmod +x /root/scripts/create_chain.sh && \
    chmod +x /root/scripts/create_cert.sh && \
    chmod +x /root/scripts/create_san_wildcard_cert.sh && \
    chmod +x /root/scripts/revoke_cert.sh && \
    chmod +x /root/scripts/get_chain.sh && \
    chmod +x /root/scripts/get_cert.sh &&\
    chmod +x /root/scripts/get_key.sh

RUN /root/scripts/create_chain.sh

# Setup nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
RUN mkdir -p /etc/nginx/conf.d/

# Copy React Application Source
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Move the built app to nginx serve directory
RUN cp -r dist/* /var/www/html/

# Setup PHP API scripts to interface with the certificate scripts
COPY api /var/www/html/api
RUN chmod -R 755 /var/www/html/api

# Create startup script
COPY src/docker-entrypoint.sh docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh

# Expose ports
EXPOSE 2560 80

ENTRYPOINT [ "/bin/sh", "docker-entrypoint.sh" ]