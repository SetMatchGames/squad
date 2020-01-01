#!/bin/sh
# wait-for-ganache.sh

set -e

host="$1"
shift
cmd="$@"

post_data='{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

echo "Waiting for Ganache"
until curl -sf -X POST --data $post_data $host; do
    echo "waiting..."
    sleep 3
done

>&2 echo
echo "Ganache is up - executing command"
exec $cmd
