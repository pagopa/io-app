#!/bin/bash

IO_BACKEND_VERSION=v17.5.2
# need to change after merge on io-services-metadata
IO_SERVICES_METADATA_VERSION=1.0.92
# Session manager version
IO_SESSION_MANAGER_VERSION=1.8.0
# IO Wallet Backend version
IO_WALLET_BACKEND_VERSION=v16.14.0

declare -a apis=(
  # Backend APIs
  "./definitions/backend https://raw.githubusercontent.com/pagopa/io-backend/$IO_BACKEND_VERSION/api_backend.yaml"
  # pagoPA APIs
  "./definitions/pagopa assets/paymentManager/spec.json"
  "./definitions/pagopa/walletv2 https://raw.githubusercontent.com/pagopa/io-services-metadata/$IO_SERVICES_METADATA_VERSION/bonus/specs/bpd/pm/walletv2.json"
  "./definitions/pagopa/walletv3 https://raw.githubusercontent.com/pagopa/pagopa-infra/v1.202.0/src/domains/pay-wallet-app/api/io-payment-wallet/v1/_openapi.json.tpl"
  "./definitions/pagopa/ecommerce https://raw.githubusercontent.com/pagopa/pagopa-infra/v1.202.0/src/domains/ecommerce-app/api/ecommerce-io/v2/_openapi.json.tpl"
  "./definitions/pagopa/biz-events https://raw.githubusercontent.com/pagopa/pagopa-biz-events-service/refs/tags/0.1.87/openapi/openapi_lap_jwt.json"
  "./definitions/pagopa/platform https://raw.githubusercontent.com/pagopa/pagopa-infra/v1.64.0/src/domains/shared-app/api/session-wallet/v1/_openapi.json.tpl"
  "./definitions/pagopa/cobadge/configuration https://raw.githubusercontent.com/pagopa/io-services-metadata/$IO_SERVICES_METADATA_VERSION/pagopa/cobadge/abi_definitions.yml"
  "./definitions/pagopa/privative/configuration https://raw.githubusercontent.com/pagopa/io-services-metadata/$IO_SERVICES_METADATA_VERSION/pagopa/privative/definitions.yml"
  # IDPay APIs
  "./definitions/idpay https://raw.githubusercontent.com/pagopa/cstar-securehub-infra-api-spec/refs/tags/v3.10.2/src/idpay/apim/api/idpay_appio_full/openapi.appio.full.yml"
  # Services APIs
  "./definitions/services https://raw.githubusercontent.com/pagopa/io-backend/$IO_BACKEND_VERSION/api_services_app_backend.yaml"
  # Lollipop APIs
  "./definitions/lollipop https://raw.githubusercontent.com/pagopa/io-backend/$IO_BACKEND_VERSION/api_lollipop_first_consumer.yaml"
  # Trial system APIs
  "./definitions/trial_system https://raw.githubusercontent.com/pagopa/io-backend/$IO_BACKEND_VERSION/api_trial_system.yaml"
  # Fims APIs
  "./definitions/fims_history https://raw.githubusercontent.com/pagopa/io-backend/$IO_BACKEND_VERSION/api_io_fims.yaml"
  "./definitions/fims_sso https://raw.githubusercontent.com/pagopa/io-fims/a93f1a1abf5230f103d9f489b139902b87288061/apps/op-app/openapi.yaml"
  # CDN APIs
  "./definitions/content https://raw.githubusercontent.com/pagopa/io-services-metadata/$IO_SERVICES_METADATA_VERSION/definitions.yml"
  # Session Manager APIs
  "./definitions/session_manager https://raw.githubusercontent.com/pagopa/io-auth-n-identity-domain/refs/tags/io-session-manager@$IO_SESSION_MANAGER_VERSION/apps/io-session-manager/api/external.yaml"  
  # CGN APIs
  "./definitions/cgn https://raw.githubusercontent.com/pagopa/io-backend/$IO_BACKEND_VERSION/api_cgn.yaml"
  "./definitions/cgn/merchants https://raw.githubusercontent.com/pagopa/io-backend/$IO_BACKEND_VERSION/api_cgn_operator_search.yaml"
  # PN APIs
  "./definitions/pn https://raw.githubusercontent.com/pagopa/io-backend/$IO_BACKEND_VERSION/api_pn.yaml"
  "./definitions/pn/aar https://raw.githubusercontent.com/pagopa/io-messages/refs/tags/send-func@1.4.3/apps/send-func/openapi/aar-notification.yaml"
  # FCI APIs
  "./definitions/fci https://raw.githubusercontent.com/pagopa/io-backend/$IO_BACKEND_VERSION/api_io_sign.yaml"
  # ITW APIs
  "./definitions/itw https://raw.githubusercontent.com/pagopa/io-backend/$IO_WALLET_BACKEND_VERSION/api_io_wallet.yaml"
  # Connectivity APIs (used for connectivity checks)
  "./definitions/connectivity https://raw.githubusercontent.com/pagopa/io-backend/$IO_BACKEND_VERSION/api_public.yaml"
  "./definitions/cdc https://raw.githubusercontent.com/pagopa/io-backend/refs/tags/$IO_BACKEND_VERSION/openapi/generated/api_cdc.yaml"
)

for elem in "${apis[@]}"; do
    read -a strarr <<< "$elem"  # uses default whitespace IFS
    echo ${strarr[0]}; rm -rf ${strarr[0]}; mkdir -p ${strarr[0]}; yarn run gen-api-models --api-spec ${strarr[1]} --out-dir ${strarr[0]} --no-strict --response-decoders --request-types --client &
done
wait

declare -a apisNoClient=(
  "./definitions/backend https://raw.githubusercontent.com/pagopa/io-backend/$IO_BACKEND_VERSION/api_public.yaml"
  "./definitions/session_manager https://raw.githubusercontent.com/pagopa/io-auth-n-identity-domain/io-session-manager@$IO_SESSION_MANAGER_VERSION/apps/io-session-manager/api/external.yaml"
  "./definitions/pn https://raw.githubusercontent.com/pagopa/io-backend/$IO_BACKEND_VERSION/openapi/consumed/api-piattaforma-notifiche.yaml"
)

for elem in "${apisNoClient[@]}"; do
    read -a strarr <<< "$elem"  # uses default whitespace IFS
    yarn run gen-api-models --api-spec ${strarr[1]} --out-dir ${strarr[0]} &
done
wait

cp google-services-dev.json ./android/app/google-services.json

yarn generate:locales
