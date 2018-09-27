platform=$1
endpoint="https://api.instabug.com/api/sdk/v3/symbols_files"

if [ -z "${INSTABUG_TOKEN:-}" ]; then
  echo "Instabug: token not found."
  exit 1
fi

request="curl -X POST \"${endpoint}\" -s -F application_token=\"${INSTABUG_TOKEN}\" -F platform=react_native -F symbols_files=\"${platform}-sourcemap.zip\" -F os=${platform}"
res=$(eval $request)

if [ "$(echo $res | jq -r '.status')" = "ok" ]; then
  echo "Instabug: sourcemap archive successfully uploaded."
else
  echo "Instabug: sourcemap archive not successfully uploaded."
  echo "Instabug: error: $(echo $res | jq -r '.error')"
  exit 1
fi
