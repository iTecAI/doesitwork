# /usr/bin/bash

# Check installed tools
docker --version || ( echo "Docker is not installed" && exit 1 )
yarn --version || ( echo "yarn is not installed" && exit 1 )

# Get script directory
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd "$SCRIPT_DIR"
cd ..

# Get app version from package.json
VERSION_LINE=$( cat doesitwork/package.json | grep "\"version\":" )
VERSION_SPLIT=(${VERSION_LINE//\"/ })
VERSION=(${VERSION_SPLIT[2]})

echo "Building version $VERSION"

# Reset build
rm -rf "build"

mkdir -p "build/frontend"
mkdir -p "build/backend"

# Build & copy frontend
cd doesitwork
yarn build
cp -R ./build/* "../build/frontend"
cd ..
echo "Built frontend, moved to ./build/frontend"

# Copy backend
cp -R ./server/* "./build/backend"
rm -rf ./build/backend/__pycache__ ./build/backend/.env
echo "Moved backend to ./build/backend"

# Build & tag docker image
docker build -t ghcr.io/$1/doesitwork:$VERSION .