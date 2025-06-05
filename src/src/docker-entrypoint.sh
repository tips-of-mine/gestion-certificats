#!/bin/sh
# This entrypoint is responsible for leaving the OSCP running to accept requests

openssl ocsp -url http://0.0.0.0:2560 -text -index /root/tls/intermediate/index.txt \
        -CA /root/tls/intermediate/certs/ca-chain.cert.pem \
        -rkey /root/tls/intermediate/private/intermediate.key.pem -rsigner /root/tls/intermediate/certs/intermediate.cert.pem