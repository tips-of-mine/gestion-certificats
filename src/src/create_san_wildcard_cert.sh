#!/bin/sh
#

SAN="DNS:*.$2"

openssl genrsa -out /root/tls/intermediate/private/$1.key.pem 4096 > /dev/null 2>&1

chmod 400 /root/tls/intermediate/private/$1.key.pem > /dev/null 2>&1

# Create the certificate signing request (CSR) with SAN
openssl req -key /root/tls/intermediate/private/$1.key.pem -new -sha256 -out /root/tls/intermediate/csr/$1.csr.pem -subj "/C=FR/ST=NORD/L=ROUBAIX/O=IT/OU=IT/CN=$2/EMAIL=cert-req@$ROOT_DOMAIN" -config /root/tls/intermediate/openssl.cnf > /dev/null 2>&1

echo -e "y\ny\n" | openssl ca -config /root/tls/intermediate/openssl.cnf -extensions v3_leaf -days 365 -notext -md sha256 -in /root/tls/intermediate/csr/$1.csr.pem -out /root/tls/intermediate/certs/$1.cert.pem > /dev/null 2>&1

chmod 444 /root/tls/intermediate/certs/$1.cert.pem > /dev/null 2>&1
