#!/bin/sh
# Start required services and keep the container running

# Start PHP-FPM
php-fpm83 &
status=$?
if [ $status -ne 0 ]; then
  echo "Failed to start PHP-FPM: $status"
  exit $status
fi

# Start Nginx
nginx &
status=$?
if [ $status -ne 0 ]; then
  echo "Failed to start Nginx: $status"
  exit $status
fi

# Start OCSP responder
openssl ocsp -port 2560 -text -index /root/tls/intermediate/index.txt \
        -CA /root/tls/intermediate/certs/ca-chain.cert.pem \
        -rkey /root/tls/intermediate/private/intermediate.key.pem \
        -rsigner /root/tls/intermediate/certs/intermediate.cert.pem &
status=$?
if [ $status -ne 0 ]; then
  echo "Failed to start OCSP responder: $status"
  exit $status
fi

echo "All services started successfully"

# Keep the container running
while sleep 60; do
  ps aux | grep nginx | grep -q -v grep
  NGINX_STATUS=$?
  ps aux | grep php-fpm | grep -q -v grep
  PHP_STATUS=$?
  ps aux | grep "openssl ocsp" | grep -q -v grep
  OCSP_STATUS=$?
  
  if [ $NGINX_STATUS -ne 0 -o $PHP_STATUS -ne 0 -o $OCSP_STATUS -ne 0 ]; then
    echo "One of the services has exited."
    exit 1
  fi
done