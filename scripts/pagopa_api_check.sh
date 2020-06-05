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
    fi
    if [[ $line =~ PAGOPA_API_URL_PREFIX_TEST=.* ]]; then
        # take the value a strip the string
        PAGOPA_API_URL_PREFIX_TEST=$(echo $line | cut -d'=' -f 2 | tr -d "\'" | tr -d '[:space:]')
    fi
done < "$input"

printf "### COMPARING SWAGGER DEFINITIONS ###\n\n"
printf "%14s $PAGOPA_API_URL_PREFIX$PAGOPA_API_URL_SUFFIX\n" "production:" 
printf "%14s $PAGOPA_API_URL_PREFIX_TEST$PAGOPA_API_URL_SUFFIX\n" "test:" 


SEND_MSG="✅ pagopa production and test specifications have no differences"
SEND_EXIT=0
# mention matteo boschi slack account
MB_SLACK="<@UQXC9SNVD>" 

# json formatting (python pipe) is needed because diff command works by comparing line by line
PAGO_PA_PROD_CONTENT=$(curl -s $PAGOPA_API_URL_PREFIX$PAGOPA_API_URL_SUFFIX | python -m json.tool)
# remove the host section because this is the only part surely different between specs
PAGO_PA_PROD_CONTENT=$(echo $PAGO_PA_PROD_CONTENT | perl -pe "s/\"host\":\s+\".*?\",//")

PAGO_PA_TEST_CONTENT=$(curl -s $PAGOPA_API_URL_PREFIX_TEST$PAGOPA_API_URL_SUFFIX | python -m json.tool)
PAGO_PA_TEST_CONTENT=$(echo $PAGO_PA_TEST_CONTENT | perl -pe "s/\"host\":\s+\".*?\",//")


# check the diff between prod/test specs
DIFF=$(diff -w -B <(echo $PAGO_PA_PROD_CONTENT) <(echo $PAGO_PA_TEST_CONTENT))
VAR_LENGTH=${#DIFF}
printf "\n"

# check if diff output is an empty string (no difference)
if [ $VAR_LENGTH -eq "0" ]; then
    echo $SEND_MSG
else
    KO_MSG="⚠️ $MB_SLACK It seems *PROD* and *DEV* pagoPa specifications are different"
    echo "⚠️  It seems PROD and DEV pagoPa specifications are different"
    SEND_MSG=$KO_MSG
    SEND_EXIT=1
    #send slack notification
    channel="#io_status"
    res=$(curl -X POST -H 'Content-type: application/json' -H 'Authorization: Bearer '${ITALIAAPP_SLACK_TOKEN_PAGOPA_CHECK:-}'' --data '{"text":"'"$SEND_MSG"'", "channel" : "'$channel'"}' https://slack.com/api/chat.postMessage)
fi

exit $SEND_EXIT