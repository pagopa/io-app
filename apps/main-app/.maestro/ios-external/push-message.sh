#!/usr/bin/env bash
set -euo pipefail

: "${SIMULATOR_UDID:?Select a dedicated simulator: login clears its keychain}"
if ! [[ "$SIMULATOR_UDID" =~ ^[[:xdigit:]]{8}(-[[:xdigit:]]{4}){3}-[[:xdigit:]]{12}$ ]]; then
  echo "Expected an explicit simulator UUID" >&2
  exit 1
fi
cd "$(dirname "$0")"
seed() {
  curl --fail --silent --show-error --json '{}' http://127.0.0.1:3000/api/v1/message
}
target=$(seed)
id=$(jq -er '.id' <<< "$target")
subject=$(jq -er '.content.subject' <<< "$target")
body=$(jq -er '.content.markdown | split("\n")[0]' <<< "$target")
maestro --device "$SIMULATOR_UDID" test ../ios/shared/login.yaml
xcrun simctl terminate "$SIMULATOR_UDID" it.pagopa.app.io
newer=$(seed)
jq -e --arg id "$id" --arg subject "$subject" \
  '.id != $id and .content.subject != $subject' <<< "$newer" >/dev/null
title="IO Maestro $id"
jq -n --arg id "$id" --arg title "$title" \
  '{aps:{alert:{title:$title,body:"Messaggio di prova"}},message_id:$id}' |
  xcrun simctl push "$SIMULATOR_UDID" it.pagopa.app.io -
maestro --device "$SIMULATOR_UDID" test -e "TITLE=$title" -e "SUBJECT=$subject" \
  -e "BODY=$body" push-message.yaml
