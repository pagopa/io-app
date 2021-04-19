#/bin/bash
FILENAME=codecov
curl -s https://codecov.io/bash > $FILENAME
CODECOV_VERSION=$(grep 'VERSION=\".*\"' codecov | cut -d'"' -f2);
VALIDATION_FAILURE=0
for i in 1 256 512
do
  IS_DIFF=$(diff <(shasum -a $i $FILENAME) <(curl -s https://raw.githubusercontent.com/codecov/codecov-bash/$CODECOV_VERSION/SHA${i}SUM))
  if [ -z "${IS_DIFF}" ]; then
    echo "Sha:" $i "passes validation."
  else
    VALIDATION_FAILURE=1
  fi
done
if [ "${VALIDATION_FAILURE}" == 1 ]; then
  echo "Invalid Checksum Detected From Codecov. Quitting."
  exit 1
else
  echo "Starting Codecov."
  chmod +x codecov
  ./codecov
fi
rm -rf $FILENAME
