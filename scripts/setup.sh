# /usr/bin/bash

echo $2 | docker login ghcr.io -u $1 --password-stdin