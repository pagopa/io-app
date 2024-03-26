#!/bin/sh

# Check if the correct number of arguments is provided
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <path_to_e2e_ts_test_file>"
    exit 1
fi

# Navigate to the API server directory and start setup
cd _io-dev-api-server_
cp ../scripts/api-config.json config/config.json
yarn
yarn generate
yarn start &> /tmp/io-dev-api-server.log &

# wait for the server to be up and running
sleep 10

cd ..
yarn detox clean-framework-cache
yarn detox build-framework-cache
yarn detox test \
  --loglevel verbose \
  -c ios.sim.release \
  --cleanup \
  --artifacts-location /tmp/e2e_artifacts/detox/ \
  --record-logs all \
  --take-screenshots all \
  --record-videos failing \
  --debug-synchronization 1000 \
  --retries 3 "$1"