#!/bin/bash
FILENAME=codecov
curl -s https://codecov.io/bash > "${FILENAME}"
CODECOV_VERSION=$(grep 'VERSION=\".*\"' codecov | cut -d'"' -f2);
VALIDATION_FAILURE=0

echo "codecov version: ${CODECOV_VERSION}"
CODECOV_SHA=$(head -1 <(curl -s https://raw.githubusercontent.com/codecov/codecov-bash/"$CODECOV_VERSION"/SHA256SUM))
COMPUTED_SHA=$(shasum -a 256 "${FILENAME}")
if [ "${COMPUTED_SHA}" == "${CODECOV_SHA}" ]; then
  echo "sha256 checksum OK"
else
  VALIDATION_FAILURE=1
fi
if [ "${VALIDATION_FAILURE}" == 1 ]; then
  echo "Invalid checksum detected from codecov. Aborting."
  exit 1
else
  echo "Starting codecov."
  chmod +x codecov
  ./codecov
fi
rm -rf "${FILENAME}"
