FROM alpine:3.21
LABEL maintainer="hcornet@tips-of-mine.fr"

RUN apk --update add openssl

ENV ROOT_DOMAIN="root.domain"
ENV OCSP_URL="http://127.0.0.1:2560"
ENV SAN="DNS:certs.$ROOT_DOMAIN"

RUN mkdir -p /root/scripts

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

COPY src/docker-entrypoint.sh docker-entrypoint.sh
EXPOSE 2560
ENTRYPOINT [ "/bin/sh", "docker-entrypoint.sh" ]