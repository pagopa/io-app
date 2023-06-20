cd _io-dev-api-server_
cp ../scripts/api-config.json config/config.json
yarn
yarn generate
yarn start &> /tmp/e2e_artifacts/io-dev-api-server.log &
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
  --retries 3