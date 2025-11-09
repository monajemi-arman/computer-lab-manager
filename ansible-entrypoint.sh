#!/bin/sh

mkdir -p ~/.ssh
chmod 700 ~/.ssh

if [ -n "$SSH_PRIVATE_KEY" ]; then
  echo "$SSH_PRIVATE_KEY" > ~/.ssh/id_rsa
  chmod 600 ~/.ssh/id_rsa
fi

if [ -n "$SSH_PUBLIC_KEY" ]; then
  echo "$SSH_PUBLIC_KEY" > ~/.ssh/id_rsa.pub
  chmod 644 ~/.ssh/id_rsa.pub
fi

echo -e "Host *\n\tStrictHostKeyChecking no\n\tUserKnownHostsFile /dev/null" > ~/.ssh/config
chmod 600 ~/.ssh/config

exec "$@"
