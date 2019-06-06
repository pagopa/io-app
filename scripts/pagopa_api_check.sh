#!/bin/bash

# read endpoint urls from .env.production files
PAGOPA_API_URL_PREFIX=""
PAGOPA_API_URL_PREFIX_TEST=""
PAGOPA_API_URL_SUFFIX="/v2/api-docs"
input=".env.production"
while IFS= read -r line; do
    if [[ $line =~ PAGOPA_API_URL_PREFIX=.* ]]; then
        # take the value a strip the string
        PAGOPA_API_URL_PREFIX=$(echo $line | cut -d'=' -f 2 | tr -d "\'" | tr -d '[:space:]')
        PAGOPA_API_URL_PREFIX="$PAGOPA_API_URL_PREFIX$PAGOPA_API_URL_SUFFIX"
    fi
    if [[ $line =~ PAGOPA_API_URL_PREFIX_TEST=.* ]]; then
        # take the value a strip the string
        PAGOPA_API_URL_PREFIX_TEST=$(echo $line | cut -d'=' -f 2 | tr -d "\'" | tr -d '[:space:]')
        PAGOPA_API_URL_PREFIX_TEST="$PAGOPA_API_URL_PREFIX_TEST$PAGOPA_API_URL_SUFFIX"
    fi
done < "$input"

# regex pattern to handle only hosts url difference
NO_CHANGES_REGEX='.*.*<.*"host": ".*",.*---.*>.*"host": ".*",'

printf "### COMPARING SWAGGER DEFINITIONS ###\n\n"
printf "%14s $PAGOPA_API_URL_PREFIX\n" "production:" 
printf "%14s $PAGOPA_API_URL_PREFIX_TEST\n" "test:" 
OK_MSG="✅ pagopa production and test specification have no differences"
SEND_MSG=$OK_MSG
SEND_EXIT=0
# mention matteo boschi slack account
MB_SLACK="<@UGP1H4GLR>" 
DIFF=$(diff -w -B <(curl -s $PAGOPA_API_URL_PREFIX | python -m json.tool) <(curl -s $PAGOPA_API_URL_PREFIX_TEST | python -m json.tool))
printf "\n\n"
if [ -n "$DIFF" ]; then
    if [[ $DIFF =~ $NO_CHANGES_REGEX ]]; then
        printf $OK_MSG
    else
        KO_MSG="⚠️ ko. It seems *PROD* and *DEV* pagoPa specs are different $DIFF $MB_SLACK"
        printf $KO_MSG
        SEND_MSG="$KO_MSG"
        SEND_EXIT=1
    fi
fi
#send slack notification
channel="#io-status"
mesg=$SEND_MSG
user="Pagopa Specs Checker"
res=$(curl -s \
    -X POST \
    -d "token=${ITALIAAPP_SLACK_TOKEN_PAGOPA_CHECK:-}" \
    -d "channel=${channel}" \
    -d "text=${mesg}" \
    -d "username=${user}" \
    -d "icon_url=https://a.slack-edge.com/41b0a/img/plugins/circleci/service_48.png" \
    https://slack.com/api/chat.postMessage
)