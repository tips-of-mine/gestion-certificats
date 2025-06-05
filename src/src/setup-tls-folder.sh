#!/bin/sh

mkdir /root/tls/
mkdir /root/tls/certs/
mkdir /root/tls/crl/ /root/tls/newcerts/
mkdir /root/tls/private/

chmod 700 /root/tls/private
touch /root/tls/index.txt

echo 1000 > /root/tls/serial

mkdir /root/tls/intermediate/
mkdir /root/tls/intermediate/certs/
mkdir /root/tls/intermediate/crl/
mkdir /root/tls/intermediate/csr/
mkdir /root/tls/intermediate/newcerts/
mkdir /root/tls/intermediate/private/

chmod 700 /root/tls/intermediate/private
touch /root/tls/intermediate/index.txt

echo 1000 > /root/tls/intermediate/serial
echo 1000 > /root/tls/intermediate/crlnumber

touch /root/tls/intermediate/certs.db