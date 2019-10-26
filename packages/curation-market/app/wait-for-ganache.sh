#!/bin/sh
# wait-for-ganache.sh

set -e

host="$1"
shift
cmd="$@"

until curl -sf -X POST --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' $host; do
    >&2 echo "Ganache not ready - sleeping"
    sleep 1
done

>&2 echo
echo "Ganache is up - executing command"
exec $cmd
