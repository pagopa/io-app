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
OK_MSG="pagopa production and test specification have no difference"

DIFF=$(diff -w -B <(curl -s $PAGOPA_API_URL_PREFIX | python -m json.tool) <(curl -s $PAGOPA_API_URL_PREFIX_TEST | python -m json.tool))
printf "\n\n"
if [ -n "$DIFF" ]; then
    if [[ $DIFF =~ $NO_CHANGES_REGEX ]]; then
        echo $OK_MSG
        exit 0
    else
        printf "ko. It seems PROD and DEV have different specs\n\n$DIFF"
        exit 1
    fi
else
    echo $OK_MSG
    exit 0
fi