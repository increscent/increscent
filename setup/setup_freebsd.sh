#/bin/sh

# Requires root privileges

cd /home/robert/increscent

rustc liza.rs

./generate.sh

mkdir -p /usr/local/etc/nginx/sites-enabled

cp ./setup/increscent_nginx /usr/local/etc/nginx/sites-enabled/increscent
