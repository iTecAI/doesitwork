# /usr/bin/bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd "$SCRIPT_DIR"
cd ..

# Get app version from package.json
VERSION_LINE=$( cat doesitwork/package.json | grep "\"version\":" )
VERSION_SPLIT=(${VERSION_LINE//\"/ })
VERSION=(${VERSION_SPLIT[2]})

scripts/build.sh $1
docker push ghcr.io/$1/doesitwork:$VERSION