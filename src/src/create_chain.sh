#!/bin/sh

cd /root/tls

mkdir /root/tls/certs /root/tls/crl /root/ca/newcerts private

# Read and write to root in private folder
chmod 700 private
touch /root/tls/index.txt

# Echo the user id
echo 1000 > /root/tls/serial

# Generating the root key for the Certificate Authority | For simplicity without passphrase for usage within docker
openssl genrsa -out /root/tls/private/ca.key.pem 4096

# Read-only rights to the running user , root in this cases, as there is no need for any changes to the Dockerfile to declare another user and simplicity
chmod 400 /root/tls/private/ca.key.pem

# Now let's create the certificate for the authority and pass along the subject as will be ran in non-interactive mode
openssl req -config /root/tls/openssl.cnf \
        -key /root/tls/private/ca.key.pem \
        -new -x509 -days 3650 -sha256 -extensions v3_ca \
        -out /root/tls/certs/ca.cert.pem \
        -subj "/C=FR/ST=NORD/L=ROUBAIX/O=IT/OU=IT/emailAddress=sec@tips-mine.com/CN=intermediate-cert.tips-of-mine.com/"

echo "Created Root Certificate"

# Grant everyone reading rights
chmod 444 /root/tls/certs/ca.cert.pem

# Now that we created the root pair, we should use and intermediate one.
# This part is the same as above except for the folder
mkdir /root/tls/intermediate/certs /root/tls/intermediate/crl /root/tls/intermediate/csr /root/tls/intermediate/newcerts /root/tls/intermediate/private

chmod 700 /root/tls/intermediate/private
touch /root/tls/intermediate/index.txt

# We must create a serial file to add serial numbers to our certificates - This will be useful when revoking as well
echo 1000 > /root/tls/intermediate/serial
echo 1000 > /root/tls/intermediate/crlnumber
touch /root/tls/intermediate/certs.db

openssl genrsa -out /root/tls/intermediate/private/intermediate.key.pem 4096
chmod 400 /root/tls/intermediate/private/intermediate.key.pem

echo "Created Intermediate Private Key"

# Creating the intermediate certificate signing request using the intermediate ca config
openssl req -config /root/tls/intermediate/openssl.cnf \
        -key /root/tls/intermediate/private/intermediate.key.pem \
        -new -sha256 -out /root/tls/intermediate/csr/intermediate.csr.pem \
        -subj "/C=FR/ST=NORD/L=ROUBAIX/O=IT/OU=IT/emailAddress=sec@tips-mine.com/CN=intermediate-cert.tips-of-mine.com/"

echo "Created Intermediate CSR"

# Creating an intermediate certificate, by signing the previous csr with the CA key based on root ca config with the directive v3_intermediate_ca extension to sign the intermediate CSR
openssl ca -config /root/tls/openssl.cnf -extensions v3_intermediate_ca -days 3650 -notext -batch -in intermediate/csr/intermediate.csr.pem -out intermediate/certs/intermediate.cert.pem

echo "Created Intermediate Certificate Signed by root CA"

# Grant everyone reading rights
chmod 444 /root/tls/intermediate/certs/intermediate.cert.pem

# Creating certificate chain with intermediate and root
cat /root/tls/intermediate/certs/intermediate.cert.pem /root/tls/certs/ca.cert.pem > /root/tls/intermediate/certs/ca-chain.cert.pem
chmod 444 /root/tls/intermediate/certs/ca-chain.cert.pem

# Create a Certificate revocation list of the intermediate CA
openssl ca -config /root/tls/intermediate/openssl.cnf -gencrl -out /root/tls/intermediate/crl/intermediate.crl.pem

# Create OSCP key pair
openssl genrsa -out /root/tls/intermediate/private/ocsp.key.pem 4096

# Create the OSCP CSR
openssl req -config /root/tls/intermediate/openssl.cnf \
        -new -sha256 -key /root/tls/intermediate/private/ocsp.key.pem \
        -out /root/tls/intermediate/csr/ocsp.csr.pem -nodes \
        -subj "/C=FR/ST=NORD/L=ROUBAIX/O=IT/OU=IT/emailAddress=sec@tips-mine.com/CN=ocsp-cert.tips-of-mine.com/"

# Sign it
echo -e "y\ny\n" | openssl ca -config /root/tls/intermediate/openssl.cnf -extensions v3_ocsp -days 375 -notext -md sha256 -in /root/tls/intermediate/csr/ocsp.csr.pem -out /root/tls/intermediate/certs/ocsp.cert.pem