#/bin/sh

# Requires root privileges

cd /home/robert/increscent

mkdir -p /usr/local/etc/nginx/sites-enabled

cp ./setup/increscent_nginx /usr/local/etc/nginx/sites-enabled/increscent
