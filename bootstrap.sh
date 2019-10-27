#!/bin/ash

echo "bootstraping lerna packages"
lerna bootstrap
echo "executing $@"
exec "$@"
