import { SagaIterator } from "redux-saga";
import { call, put, select, take, takeLatest } from "typed-redux-saga/macro";
import * as O from "fp-ts/lib/Option";
import {
  Credential,
  createCryptoContextFor
} from "@pagopa/io-react-native-wallet";
import * as SDJWT from "@pagopa/io-react-native-wallet/src/sd-jwt";
import { SdJwt4VC } from "@pagopa/io-react-native-wallet/src/sd-jwt/types";
import { CryptoContext } from "@pagopa/io-react-native-jwt";
import { ActionType, isActionOf } from "typesafe-actions";
import { toError } from "fp-ts/lib/Either";
import { CommonActions } from "@react-navigation/native";
import { IOToast } from "@pagopa/io-app-design-system";
import { walletProviderUrl } from "../../../../config";
import {
  itwConfirmStoreCredential,
  itwIssuanceAddCredential,
  itwIssuanceChecks,
  itwIssuanceGetCredential
} from "../../store/actions/new/itwIssuanceActions";
import { ITW_PID_KEY_TAG } from "../../utils/pid";
import { ItWalletErrorTypes } from "../../utils/errors/itwErrors";
import { ITW_WIA_KEY_TAG } from "../../utils/wia";

import { itwWiaRequest } from "../../store/actions/itwWiaActions";
import {
  ItwCredentialsPidSelector,
  itwCredentialsSelector
} from "../../store/reducers/itwCredentialsReducer";
import { getOrGenerateCyptoKey } from "../../utils/keychain";
import { itwCredentialsAddCredential } from "../../store/actions/itwCredentialsActions";
import {
  itwIssuanceChecksDataSelector,
  itwIssuanceResultDataSelector
} from "../../store/reducers/new/itwIssuanceReducer";
import {
  identificationRequest,
  identificationSuccess
} from "../../../../store/actions/identification";
import I18n from "../../../../i18n";
import NavigationService from "../../../../navigation/NavigationService";
import ROUTES from "../../../../navigation/routes";

export function* watchItwIssuanceSaga(): SagaIterator {
  yield* takeLatest(itwIssuanceChecks.request, itwIssuanceChecksSaga);
  yield* takeLatest(
    itwIssuanceGetCredential.request,
    itwIssuanceGetCredentialSaga
  );
  yield* takeLatest(itwConfirmStoreCredential, addCredentialWithPin);
}

export function* itwIssuanceChecksSaga({
  payload: { credentialType, issuerUrl, displayData }
}: ActionType<typeof itwIssuanceChecks.request>): SagaIterator {
  try {
    // Issuer conf + trust
    const { issuerConf } = yield* call(
      Credential.Issuance.evaluateIssuerTrust,
      issuerUrl
    );

    const [credentialConfigurationSchema] =
      issuerConf.openid_credential_issuer.credentials_supported
        .filter(_ => _.credential_definition.type.includes(credentialType))
        .map(_ => _.credential_definition.credentialSubject);
    if (!credentialConfigurationSchema) {
      throw new Error(
        `Cannot find configuration schema for credential of type ${credentialType}`
      );
    }

    // check if credential is already in the wallet
    const storedCredentials = yield* select(itwCredentialsSelector);
    const found = storedCredentials
      .filter(O.isSome)
      .find(e => e.value.credentialType === credentialType);
    if (found) {
      yield* put(
        itwIssuanceChecks.failure({
          code: ItWalletErrorTypes.CREDENTIAL_ALREADY_EXISTING_ERROR
        })
      );
    } else {
      yield* put(
        itwIssuanceChecks.success({
          credentialType,
          issuerUrl,
          displayData,
          credentialConfigurationSchema,
          issuerConf
        })
      );
    }
  } catch (e) {
    const res = toError(e);
    yield* put(
      itwIssuanceChecks.failure({
        code: ItWalletErrorTypes.CREDENTIAL_CHECKS_GENERIC_ERROR,
        message: res.message
      })
    );
  }
}

export function* itwIssuanceGetCredentialSaga(): SagaIterator {
  try {
    const issuanceData = yield* select(itwIssuanceChecksDataSelector);

    if (O.isNone(issuanceData)) {
      throw new Error("Unexpected issuanceData");
    }

    const {
      credentialType,
      issuerUrl,
      issuerConf,
      credentialConfigurationSchema,
      displayData
    } = issuanceData.value;

    const [walletInstanceAttestation, wiaCryptoContext] = yield* call(
      getWalletInstanceAttestation
    );
    const keyTag = `${Math.random()}`;
    yield* call(getOrGenerateCyptoKey, keyTag);
    const credentialCryptoContext = createCryptoContextFor(keyTag);

    // from app config
    const walletProviderBaseUrl = walletProviderUrl;

    // start user authz
    const { requestUri, clientId } = yield* call(
      Credential.Issuance.startUserAuthorization,
      issuerConf,
      credentialType,
      {
        walletInstanceAttestation,
        walletProviderBaseUrl,
        wiaCryptoContext
      }
    );

    const { code } = yield* call(
      completeUserAuthorizationWithPID,
      requestUri,
      issuerUrl,
      {
        wiaCryptoContext,
        walletInstanceAttestation
      }
    );

    // access authz
    const { accessToken, nonce } = yield* call(
      Credential.Issuance.authorizeAccess,
      issuerConf,
      code,
      clientId,
      { walletInstanceAttestation, walletProviderBaseUrl }
    );

    // obtain cred
    const { credential, format } = yield* call(
      Credential.Issuance.obtainCredential,
      issuerConf,
      accessToken,
      nonce,
      clientId,
      credentialType,
      { credentialCryptoContext, walletProviderBaseUrl }
    );

    const parsedCredential = SDJWT.decode(
      credential,
      SdJwt4VC
    ).disclosures.reduce(
      (p, { decoded: [, key, value] }) => ({
        ...p,
        [key]: typeof value === "string" ? value : JSON.stringify(value)
      }),
      {} as Record<string, string>
    );

    const issuerName =
      issuerConf.federation_entity.organization_name ||
      I18n.t("features.itWallet.generic.placeholders.organizationName");

    yield* put(
      itwIssuanceGetCredential.success({
        issuerName,
        keyTag,
        credential,
        format,
        parsedCredential,
        credentialConfigurationSchema,
        credentialType,
        displayData
      })
    );
  } catch (e) {
    const res = toError(e);
    yield* put(
      itwIssuanceChecks.failure({
        code: ItWalletErrorTypes.CREDENTIAL_CHECKS_GENERIC_ERROR,
        message: res.message
      })
    );
  }
}

// add type and error mapping
function* addCredentialWithPin() {
  try {
    const resultData = yield* select(itwIssuanceResultDataSelector);
    if (O.isNone(resultData)) {
      throw new Error();
    }
    yield* put(
      identificationRequest(false, true, undefined, {
        label: I18n.t("global.buttons.cancel"),
        onCancel: () =>
          NavigationService.dispatchNavigationAction(CommonActions.goBack())
      })
    );

    const res = yield* take(identificationSuccess);

    if (isActionOf(identificationSuccess, res)) {
      const {
        keyTag,
        credential,
        format,
        parsedCredential,
        credentialType,
        displayData,
        credentialConfigurationSchema
      } = resultData.value;

      yield* put(
        itwCredentialsAddCredential.success({
          credential,
          format,
          keyTag,
          credentialConfigurationSchema,
          parsedCredential,
          credentialType,
          displayData
        })
      );

      yield* call(
        NavigationService.dispatchNavigationAction,
        CommonActions.navigate(ROUTES.MAIN, {
          screen: ROUTES.ITWALLET_HOME
        })
      );

      IOToast.success(
        I18n.t(
          "features.itWallet.issuing.credentialPreviewScreen.toast.success"
        )
      );
    }
  } catch (e) {
    const res = toError(e);
    yield* put(
      itwIssuanceAddCredential.failure({
        code: ItWalletErrorTypes.CREDENTIAL_ADD_ERROR,
        message: res.message
      })
    );
  }
}

function* completeUserAuthorizationWithPID(
  requestURI: Awaited<
    ReturnType<Credential.Presentation.StartFlow>
  >["requestURI"],
  rpUrl: Awaited<ReturnType<Credential.Presentation.StartFlow>>["clientId"],
  {
    wiaCryptoContext,
    walletInstanceAttestation
  }: { wiaCryptoContext: CryptoContext; walletInstanceAttestation: string }
): Iterator<
  any,
  Awaited<ReturnType<Credential.Issuance.CompleteUserAuthorization>>
> {
  const { rpConf } = yield* call(
    Credential.Presentation.evaluateRelyingPartyTrust,
    rpUrl
  );

  // start user authz
  const { requestObject } = yield* call(
    Credential.Presentation.getRequestObject,
    requestURI,
    rpConf,
    { wiaCryptoContext, walletInstanceAttestation }
  );

  const [pidToken, pidCryptoContext] = yield* call(getPID);

  const claims = [
    "unique_id",
    "given_name",
    "family_name",
    "birthdate",
    "place_of_birth",
    "tax_id_number",
    "evidence"
  ];

  // access authz
  const { response_code } = yield* call(
    Credential.Presentation.sendAuthorizationResponse,
    requestObject,
    rpConf,
    [pidToken, claims, pidCryptoContext],
    {
      walletInstanceAttestation
    }
  );

  if (!response_code) {
    const message = `Expecting response_code from sendAuthorizationResponse, received undefined`;
    throw new Error(message);
  }

  return { code: response_code };
}

function* getWalletInstanceAttestation(): Iterator<
  any,
  readonly [string, CryptoContext]
> {
  yield* put(itwWiaRequest.request());
  const errorOrWia = yield* take([
    itwWiaRequest.failure,
    itwWiaRequest.success
  ]);
  if (isActionOf(itwWiaRequest.failure, errorOrWia)) {
    throw errorOrWia.payload;
  } else if (isActionOf(itwWiaRequest.success, errorOrWia)) {
    const wia = errorOrWia.payload;
    const wiaKeytag = ITW_WIA_KEY_TAG;
    const wiaCryptoContext = createCryptoContextFor(wiaKeytag);
    return yield* call(() => [wia, wiaCryptoContext] as const);
  } else {
    throw new Error(`Unexpected action type: ${errorOrWia.type}`);
  }
}

function* getPID(): Iterator<any, readonly [string, CryptoContext]> {
  const maybePid = yield* select(ItwCredentialsPidSelector);
  if (O.isNone(maybePid)) {
    const message = `Expecting response_code from sendAuthorizationResponse, received undefined`;
    throw new Error(message);
  }
  const pidKeytag = ITW_PID_KEY_TAG;
  const pidCryptoContext = createCryptoContextFor(pidKeytag);
  return yield* call(
    () => [maybePid.value.credential, pidCryptoContext] as const
  );
}
