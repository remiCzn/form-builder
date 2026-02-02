rm -rf ./build
mkdir -p ./build

mv backend/dist ./build/dist
cp backend/package.json ./build/package.json
cp yarn.lock ./build/yarn.lock
cp backend/pm2.json ./build/pm2.json

mv web/dist ./build/dist/public
