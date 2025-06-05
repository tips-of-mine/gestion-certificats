#!/bin/sh
# First generate the key for the client

openssl genrsa -out /root/tls/intermediate/private/$1.key.pem 4096 > /dev/null 2>&1

chmod 400 /root/tls/intermediate/private/$1.key.pem > /dev/null 2>&1

# Then create the certificate signing request
openssl req -config /root/tls/intermediate/openssl.cnf \
        -key /root/tls/intermediate/private/$1.key.pem \
        -new -sha256 -out /root/tls/intermediate/csr/$1.csr.pem \
        -subj "/C=FR/ST=NORD/L=ROUBAIX/O=IT/OU=IT/emailAddress=sec@tips-mine.com/CN=$2/" > /dev/null 2>&1

# Now sign it with the intermediate CA
echo -e "y\ny\n" | openssl ca -config /root/tls/intermediate/openssl.cnf \
        -extensions v3_leaf -days 365 -notext -md sha256 \
        -in /root/tls/intermediate/csr/$1.csr.pem \
        -out /root/tls/intermediate/certs/$1.cert.pem > /dev/null 2>&1

chmod 444 /root/tls/intermediate/certs/$1.cert.pem > /dev/null 2>&1

cat /root/tls/intermediate/certs/$1.cert.pem
