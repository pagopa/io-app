import { SagaIterator } from "redux-saga";
import { call, put, select, take, takeLatest } from "typed-redux-saga/macro";
import * as O from "fp-ts/lib/Option";
import {
  Credential,
  createCryptoContextFor
} from "@pagopa/io-react-native-wallet";
import { CryptoContext } from "@pagopa/io-react-native-jwt";
import { ActionType, isActionOf } from "typesafe-actions";
import { toError } from "fp-ts/lib/Either";
import { CommonActions } from "@react-navigation/native";
import { IOToast } from "@pagopa/io-app-design-system";
import {
  itwConfirmStoreCredential,
  itwIssuanceCredentialChecks,
  itwIssuanceCredential
} from "../store/actions/itwIssuanceCredentialActions";
import { ItWalletErrorTypes } from "../utils/itwErrorsUtils";
import { itwWiaRequest } from "../store/actions/itwWiaActions";
import {
  itwPersistedCredentialsValuePidSelector,
  itwPersistedCredentialsValueSelector
} from "../store/reducers/itwPersistedCredentialsReducer";
import {
  ITW_PID_KEY_TAG,
  ITW_WIA_KEY_TAG,
  getOrGenerateCyptoKey
} from "../utils/itwSecureStorageUtils";
import { itwPersistedCredentialsAdd } from "../store/actions/itwPersistedCredentialsActions";
import {
  itwIssuanceCredentialChecksValueSelector,
  itwIssuanceResultDataSelector
} from "../store/reducers/itwIssuanceCredentialReducer";
import I18n from "../../../i18n";
import NavigationService from "../../../navigation/NavigationService";
import ROUTES from "../../../navigation/routes";
import { walletProviderBaseUrl } from "../../../config";
import { StoredCredential } from "../utils/types";
import { verifyPin } from "../utils/itwSagaUtils";

/**
 * Watcher for issuance related sagas.
 */
export function* watchItwIssuanceCredentialSaga(): SagaIterator {
  yield* takeLatest(
    itwIssuanceCredentialChecks.request,
    handleItwIssuanceCredentialChecks
  );
  yield* takeLatest(itwIssuanceCredential.request, handleItwIssuanceCredential);
  yield* takeLatest(itwConfirmStoreCredential, handleAddCredentialWithPin);
}

/**
 * Saga which handles the issuance checks before starting the issuance flow.
 * @param payload - The payload of the action which includes the credentialType, the issuerUrl and the displayData which are currently mocked.
 */
export function* handleItwIssuanceCredentialChecks({
  payload: { credentialType, issuerUrl, displayData }
}: ActionType<typeof itwIssuanceCredentialChecks.request>): SagaIterator {
  try {
    // Issuer conf + trust
    const { issuerConf } = yield* call(
      Credential.Issuance.evaluateIssuerTrust,
      issuerUrl
    );

    const [credentialConfigurationSchema] =
      issuerConf.openid_credential_issuer.credentials_supported
        .filter(_ => _.format === "vc+sd-jwt")
        .filter(_ => _.credential_definition.type.includes(credentialType))
        .map(_ => _.credential_definition.credentialSubject);
    if (!credentialConfigurationSchema) {
      throw new Error(
        `Cannot find configuration schema for credential of type ${credentialType}`
      );
    }

    // check if credential is already in the wallet
    const storedCredentials = yield* select(
      itwPersistedCredentialsValueSelector
    );
    const found = storedCredentials
      .filter(O.isSome)
      .find(e => e.value.credentialType === credentialType);
    if (found) {
      yield* put(
        itwIssuanceCredentialChecks.failure({
          code: ItWalletErrorTypes.CREDENTIAL_ALREADY_EXISTING_ERROR
        })
      );
    } else {
      yield* put(
        itwIssuanceCredentialChecks.success({
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
      itwIssuanceCredentialChecks.failure({
        code: ItWalletErrorTypes.CREDENTIAL_CHECKS_GENERIC_ERROR,
        message: res.message
      })
    );
  }
}

/**
 * Saga which handles the issuance flow.
 */
export function* handleItwIssuanceCredential(): SagaIterator {
  try {
    yield* call(verifyPin);
    const issuanceData = yield* select(
      itwIssuanceCredentialChecksValueSelector
    );

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
      {
        walletInstanceAttestation,
        walletProviderBaseUrl
      }
    );

    // obtain credential
    const { credential, format } = yield* call(
      Credential.Issuance.obtainCredential,
      issuerConf,
      accessToken,
      nonce,
      clientId,
      credentialType,
      "vc+sd-jwt",
      {
        walletProviderBaseUrl,
        credentialCryptoContext
      }
    );

    const { parsedCredential } = yield* call(
      Credential.Issuance.verifyAndParseCredential,
      issuerConf,
      credential,
      format,
      { credentialCryptoContext, ignoreMissingAttributes: true }
    );

    yield* put(
      itwIssuanceCredential.success({
        issuerConf,
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
      itwIssuanceCredential.failure({
        code: ItWalletErrorTypes.CREDENTIAL_CHECKS_GENERIC_ERROR,
        message: res.message
      })
    );
  }
}

/**
 * Saga which handles the addition of a credential to the wallet by showing the pin screen.
 */
function* handleAddCredentialWithPin() {
  try {
    const resultData = yield* select(itwIssuanceResultDataSelector);
    if (O.isNone(resultData)) {
      throw new Error();
    }
    yield* call(verifyPin);
    yield* put(itwPersistedCredentialsAdd.success(resultData.value));

    yield* call(
      NavigationService.dispatchNavigationAction,
      CommonActions.navigate(ROUTES.MAIN, {
        screen: ROUTES.ITWALLET_HOME
      })
    );

    IOToast.success(
      I18n.t("features.itWallet.issuing.credentialPreviewScreen.toast.success")
    );
  } catch (e) {
    IOToast.error(
      I18n.t("features.itWallet.issuing.credentialPreviewScreen.toast.failure")
    );
  }
}

/**
 * Function which handles the completion of the user authorization with the PID.
 * @param requestURI - The request URI.
 * @param rpUrl - the relying party URL (the issuer acts as a relying party in this case).
 * @param wiaCryptoContext - The crypto context of the wallet instance attestation.
 * @param walletInstanceAttestation - The wallet instance attestation.
 * @returns
 */
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

  const [pid, pidCryptoContext] = yield* call(getPID);

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
    [pid.credential, claims, pidCryptoContext],
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

/**
 * Helper function which gets the wallet instance attestation by requesting it and creating a crypto context for it.
 * @returns the wallet instance attestation and the crypto context.
 */
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
    const wiaCryptoContext = createCryptoContextFor(ITW_WIA_KEY_TAG);
    return yield* call(() => [wia, wiaCryptoContext] as const);
  } else {
    throw new Error(`Unexpected action type: ${errorOrWia.type}`);
  }
}

/**
 * Helper function which gets the PID from the store and creates a crypto context for it.
 * @returns the PID and the crypto context.
 */
function* getPID(): Iterator<any, readonly [StoredCredential, CryptoContext]> {
  const maybePid = yield* select(itwPersistedCredentialsValuePidSelector);
  if (O.isNone(maybePid)) {
    const message = `Expecting response_code from sendAuthorizationResponse, received undefined`;
    throw new Error(message);
  }
  const pidCryptoContext = createCryptoContextFor(ITW_PID_KEY_TAG);
  return yield* call(() => [maybePid.value, pidCryptoContext] as const);
}
