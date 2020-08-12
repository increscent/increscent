#/bin/sh

# Requires root privileges

cd /home/robert/increscent

npm install

cp ./setup/increscent_service /usr/local/etc/rc.d/increscent

printf '\nincrescent_enable="YES"\n' >> /etc/rc.conf

mkdir -p /usr/local/etc/nginx/sites-enabled

cp ./setup/increscent_nginx /usr/local/etc/nginx/sites-enabled/increscent
