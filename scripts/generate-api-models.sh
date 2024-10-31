#!/bin/bash

IO_BACKEND_VERSION=v14.3.0-RELEASE
IO_SERVICES_METADATA_VERSION=1.0.45

declare -a apis=(
  # Backend APIs
  "./definitions/backend https://raw.githubusercontent.com/pagopa/io-backend/$IO_BACKEND_VERSION/api_backend.yaml"
  # pagoPA APIs
  "./definitions/pagopa assets/paymentManager/spec.json"
  "./definitions/pagopa/walletv2 https://raw.githubusercontent.com/pagopa/io-services-metadata/$IO_SERVICES_METADATA_VERSION/bonus/specs/bpd/pm/walletv2.json"
  "./definitions/pagopa/walletv3 https://raw.githubusercontent.com/pagopa/pagopa-infra/v1.202.0/src/domains/pay-wallet-app/api/io-payment-wallet/v1/_openapi.json.tpl"
  "./definitions/pagopa/ecommerce https://raw.githubusercontent.com/pagopa/pagopa-infra/v1.202.0/src/domains/ecommerce-app/api/ecommerce-io/v2/_openapi.json.tpl"
  "./definitions/pagopa/biz-events https://raw.githubusercontent.com/pagopa/pagopa-biz-events-service/0.1.57/openapi/openapi_io_patch_lap.json"
  "./definitions/pagopa/platform https://raw.githubusercontent.com/pagopa/pagopa-infra/v1.64.0/src/domains/shared-app/api/session-wallet/v1/_openapi.json.tpl"
  "./definitions/pagopa/cobadge/configuration https://raw.githubusercontent.com/pagopa/io-services-metadata/$IO_SERVICES_METADATA_VERSION/pagopa/cobadge/abi_definitions.yml"
  "./definitions/pagopa/privative/configuration https://raw.githubusercontent.com/pagopa/io-services-metadata/$IO_SERVICES_METADATA_VERSION/pagopa/privative/definitions.yml"
  # IDPay APIs
  "./definitions/idpay https://raw.githubusercontent.com/pagopa/cstar-infrastructure/v8.25.1/src/domains/idpay-app/api/idpay_appio_full/openapi.appio.full.yml"
  # Services APIs
  "./definitions/services https://raw.githubusercontent.com/pagopa/io-backend/$IO_BACKEND_VERSION/api_services_app_backend.yaml"
  # Lollipop APIs
  "./definitions/lollipop https://raw.githubusercontent.com/pagopa/io-backend/$IO_BACKEND_VERSION/api_lollipop_first_consumer.yaml"
  # FastLogin APIs
  "./definitions/fast_login https://raw.githubusercontent.com/pagopa/io-auth-n-identity-domain/io-session-manager@1.0.0/apps/io-session-manager/api/fast-login.yaml"
  # Trial system APIs
  "./definitions/trial_system https://raw.githubusercontent.com/pagopa/io-backend/$IO_BACKEND_VERSION/api_trial_system.yaml"
  # Fims APIs
  "./definitions/fims assets/FimsSwager.yml"
  # CDN APIs
  "./definitions/content https://raw.githubusercontent.com/pagopa/io-services-metadata/$IO_SERVICES_METADATA_VERSION/definitions.yml"
  # Session Manager APIs
  "./definitions/session_manager https://raw.githubusercontent.com/pagopa/io-auth-n-identity-domain/io-session-manager@1.0.0/apps/io-session-manager/api/internal.yaml"
  # CGN APIs
  "./definitions/cgn https://raw.githubusercontent.com/pagopa/io-backend/$IO_BACKEND_VERSION/api_cgn.yaml"
  "./definitions/cgn/merchants https://raw.githubusercontent.com/pagopa/io-backend/$IO_BACKEND_VERSION/api_cgn_operator_search.yaml"
  # Green Pass APIs
  "./definitions/eu_covid_cert https://raw.githubusercontent.com/pagopa/io-backend/$IO_BACKEND_VERSION/api_eucovidcert.yaml"
  # PN APIs
  "./definitions/pn https://raw.githubusercontent.com/pagopa/io-backend/$IO_BACKEND_VERSION/api_pn.yaml"
  # CDC APIs
  "./definitions/cdc assets/CdcSwagger.yml"
  # FCI APIs
  "./definitions/fci https://raw.githubusercontent.com/pagopa/io-backend/$IO_BACKEND_VERSION/api_io_sign.yaml"
)

for elem in "${apis[@]}"; do
    read -a strarr <<< "$elem"  # uses default whitespace IFS
    echo ${strarr[0]}
    rm -rf ${strarr[0]}
    mkdir -p ${strarr[0]}
    yarn run gen-api-models --api-spec ${strarr[1]} --out-dir ${strarr[0]} --no-strict --response-decoders --request-types --client
done

yarn run gen-api-models --api-spec "https://raw.githubusercontent.com/pagopa/io-backend/$IO_BACKEND_VERSION/api_public.yaml" --out-dir ./definitions/backend
yarn run gen-api-models --api-spec "https://raw.githubusercontent.com/pagopa/io-auth-n-identity-domain/io-session-manager@1.0.0/apps/io-session-manager/api/public.yaml" --out-dir ./definitions/session_manager
yarn run gen-api-models --api-spec "https://raw.githubusercontent.com/pagopa/io-backend/$IO_BACKEND_VERSION/openapi/consumed/api-piattaforma-notifiche.yaml" --out-dir ./definitions/pn

cp mock-google-services.json ./android/app/google-services.json

# "generate:fci-api": "rm -rf ./definitions/fci && mkdir -p ./definitions/fci  && gen-api-models --api-spec $npm_package_api_fci --out-dir ./definitions/fci --no-strict --request-types --response-decoders --client"


yarn ts-node --skip-project -O '{"lib":["es2015"]}' scripts/make-locales.ts