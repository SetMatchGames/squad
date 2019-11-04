#!/bin/sh
# wait-for-ganache.sh

set -e

host="$1"
shift
cmd="$@"

echo "Waiting for Ganache"
until curl -sf -X POST --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' $host; do
    printf('.')
    sleep 1
done

>&2 echo
echo "Ganache is up - executing command"
exec $cmd
