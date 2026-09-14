#!/bin/bash

# Merge of apps/main-app and apps/dev-api-server generate-api-models scripts.
# On conflicting definitions (same output dir, different source/version), main-app's
# source/version wins; consumers are expected to review and fix mismatches.

IO_BACKEND_VERSION=v20.0.0
# Legacy version kept for backward-compatibility definitions removed in v20.0.0
# (e.g. api_trial_system.yaml, UserMetadata, ServerInfo from api_backend.yaml)
IO_BACKEND_LEGACY_VERSION=v17.5.2
IO_SERVICES_METADATA_VERSION=1.1.4
# Session manager version
IO_SESSION_MANAGER_VERSION=1.23.1
# Send function version
SEND_FUNC_VERSION=1.5.5
# IO Wallet user function version
IO_WALLET_USER_FUNC_VERSION=4.1.11
# IO Services CMS version
IO_SERVICES_APP_BACKEND=3.1.0
# CGN and CDC APIs are generated with a different version of io-backend, so we need to specify it separately
IO_BACKEND_VERSION_CGN_CDC=v19.0.0

# Definitions generated with --client --no-strict --response-decoders --request-types
declare -a apis=(
  "./generated/definitions/pagopa https://raw.githubusercontent.com/pagopa/io-app/master/apps/main-app/assets/paymentManager/spec.json"
  "./generated/definitions/pagopa/walletv2 https://raw.githubusercontent.com/pagopa/io-services-metadata/$IO_SERVICES_METADATA_VERSION/bonus/specs/bpd/pm/walletv2.json"
  "./generated/definitions/pagopa/walletv3 https://raw.githubusercontent.com/pagopa/pagopa-infra/refs/tags/v1.745.1/src/domains/pay-wallet-app/api/io-payment-wallet/v1/_openapi.json.tpl"
  "./generated/definitions/pagopa/ecommerce https://raw.githubusercontent.com/pagopa/pagopa-infra/v1.731.1/src/domains/ecommerce-app/api/ecommerce-io/v2/_openapi.json.tpl"
  "./generated/definitions/pagopa/biz-events https://raw.githubusercontent.com/pagopa/pagopa-biz-events-service/refs/tags/0.3.5/openapi/openapi_lap_jwt.json"
  "./generated/definitions/pagopa/platform https://raw.githubusercontent.com/pagopa/pagopa-infra/v1.64.0/src/domains/shared-app/api/session-wallet/v1/_openapi.json.tpl"
  "./generated/definitions/pagopa/cobadge/configuration https://raw.githubusercontent.com/pagopa/io-services-metadata/$IO_SERVICES_METADATA_VERSION/pagopa/cobadge/abi_definitions.yml"
  "./generated/definitions/pagopa/privative/configuration https://raw.githubusercontent.com/pagopa/io-services-metadata/$IO_SERVICES_METADATA_VERSION/pagopa/privative/definitions.yml"
  "./generated/definitions/identity https://raw.githubusercontent.com/pagopa/io-backend/$IO_BACKEND_VERSION/openapi/generated/api_identity.yaml"
  "./generated/definitions/communication https://raw.githubusercontent.com/pagopa/io-backend/$IO_BACKEND_VERSION/openapi/generated/api_communication.yaml"
  "./generated/definitions/idpay https://raw.githubusercontent.com/pagopa/cstar-securehub-infra-api-spec/refs/tags/v3.10.2/src/idpay/apim/api/idpay_appio_full/openapi.appio.full.yml"
  "./generated/definitions/services https://raw.githubusercontent.com/pagopa/io-services-cms/io-services-app-backend@$IO_SERVICES_APP_BACKEND/apps/app-backend/api/external.yaml"
  "./generated/definitions/fims_history https://raw.githubusercontent.com/pagopa/io-backend/$IO_BACKEND_VERSION/openapi/generated/api_fims_platform.yaml"
  "./generated/definitions/fims_sso https://raw.githubusercontent.com/pagopa/io-fims/a93f1a1abf5230f103d9f489b139902b87288061/apps/op-app/openapi.yaml"
  "./generated/definitions/content https://raw.githubusercontent.com/pagopa/io-services-metadata/$IO_SERVICES_METADATA_VERSION/definitions.yml"
  "./generated/definitions/session_manager https://raw.githubusercontent.com/pagopa/io-auth-n-identity-domain/io-session-manager@$IO_SESSION_MANAGER_VERSION/apps/io-session-manager/api/external.yaml"
  "./generated/definitions/cgn https://raw.githubusercontent.com/pagopa/io-backend/$IO_BACKEND_VERSION_CGN_CDC/openapi/generated/api_cgn_card_platform.yaml"
  "./generated/definitions/cgn/merchants https://raw.githubusercontent.com/pagopa/io-backend/$IO_BACKEND_VERSION_CGN_CDC/openapi/generated/api_cgn_search_platform.yaml"
  "./generated/definitions/pn/aar https://raw.githubusercontent.com/pagopa/io-messages/refs/tags/send-func@$SEND_FUNC_VERSION/apps/send-func/openapi/aar-notification.yaml"
  "./generated/definitions/pn/lollipop-lambda https://raw.githubusercontent.com/pagopa/io-messages/refs/tags/send-func@$SEND_FUNC_VERSION/apps/send-func/openapi/lollipop-integration-check.yaml"
  "./generated/definitions/fci https://raw.githubusercontent.com/pagopa/io-sign/refs/tags/io-func-sign-user@2.9.2/apps/io-func-sign-user/api/external.yaml"
  "./generated/definitions/itw https://raw.githubusercontent.com/pagopa/io-wallet/io-wallet-user-func@$IO_WALLET_USER_FUNC_VERSION/apps/io-wallet-user-func/openapi-external/user_v1/swagger.yaml"
  "./generated/definitions/connectivity https://raw.githubusercontent.com/pagopa/io-backend/$IO_BACKEND_VERSION/api_public.yaml"
  "./generated/definitions/cdc https://raw.githubusercontent.com/pagopa/io-backend/refs/tags/$IO_BACKEND_VERSION_CGN_CDC/openapi/generated/api_cdc_support_platform.yaml"
)

# Definitions used only by dev-api-server, kept without --client
declare -a apisNoClient=(
  "./generated/definitions/backend https://raw.githubusercontent.com/pagopa/io-backend/$IO_BACKEND_VERSION/api_public.yaml"
  "./generated/definitions/cgn/geo https://raw.githubusercontent.com/pagopa/io-backend/here_geoapi_integration/api_geo.yaml"
  "./generated/definitions/trial_system https://raw.githubusercontent.com/pagopa/io-backend/$IO_BACKEND_LEGACY_VERSION/openapi/generated/api_trial_system.yaml"
)

# "pn" is populated from two specs layered together (io-backend's api_pn.yaml plus the
# consumed api-piattaforma-notifiche.yaml); it must NOT be rm -rf'd here or it would wipe
# the pn/aar and pn/lollipop-lambda subfolders generated above.
declare -a apisNoClientNoRM=(
  "./generated/definitions/pn https://raw.githubusercontent.com/pagopa/io-backend/$IO_BACKEND_VERSION/api_pn.yaml"
  "./generated/definitions/pn https://raw.githubusercontent.com/pagopa/io-backend/$IO_BACKEND_VERSION/openapi/consumed/api-piattaforma-notifiche.yaml"
)

for elem in "${apis[@]}"; do
    read -a strarr <<< "$elem"  # uses default whitespace IFS
    echo ${strarr[0]}; rm -rf ${strarr[0]}; mkdir -p ${strarr[0]}; pnpm exec gen-api-models --api-spec ${strarr[1]} --out-dir ${strarr[0]} --no-strict --response-decoders --request-types --client &
done
wait

for elem in "${apisNoClient[@]}"; do
  read -a strarr <<< "$elem"  # uses default whitespace IFS
  echo ${strarr[0]}; rm -rf ${strarr[0]}; mkdir -p ${strarr[0]}; pnpm exec gen-api-models --api-spec ${strarr[1]} --out-dir ${strarr[0]} --no-strict --response-decoders --request-types &
done
wait

for elem in "${apisNoClientNoRM[@]}"; do
  read -a strarr <<< "$elem"  # uses default whitespace IFS
  echo ${strarr[0]}; mkdir -p ${strarr[0]}; pnpm exec gen-api-models --api-spec ${strarr[1]} --out-dir ${strarr[0]} --no-strict --response-decoders --request-types
done
