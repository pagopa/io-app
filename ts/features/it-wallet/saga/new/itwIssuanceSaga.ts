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
  itwIssuanceChecks,
  itwIssuanceGetCredential
} from "../../store/actions/new/itwIssuanceActions";
import { ITW_PID_KEY_TAG } from "../../utils/pid";
import { ItWalletErrorTypes } from "../../utils/itwErrorsUtils";
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
import I18n from "../../../../i18n";
import NavigationService from "../../../../navigation/NavigationService";
import ROUTES from "../../../../navigation/routes";
import { verifyPin } from "../itwSagaUtils";

/**
 * Watcher for issuance related sagas.
 */
export function* watchItwIssuanceSaga(): SagaIterator {
  yield* takeLatest(itwIssuanceChecks.request, handleIssuanceChecks);
  yield* takeLatest(
    itwIssuanceGetCredential.request,
    handleIssuanceGetCredential
  );
  yield* takeLatest(itwConfirmStoreCredential, handleAddCredentialWithPin);
}

/**
 * Saga which handles the issuance checks before starting the issuance flow.
 * @param payload - The payload of the action which includes the credentialType, the issuerUrl and the displayData which are currently mocked.
 */
export function* handleIssuanceChecks({
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
        .filter(_ => _.format === "vc+sd-jwt")
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

/**
 * Saga which handles the issuance flow.
 */
export function* handleIssuanceGetCredential(): SagaIterator {
  try {
    yield* call(verifyPin);
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

    // TODO(SIW-659): replace with the VerificationAndParseCredential function
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

    yield* put(
      itwIssuanceGetCredential.success({
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
      itwIssuanceGetCredential.failure({
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
    yield* put(itwCredentialsAddCredential.success(resultData.value));

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
    const wiaKeytag = ITW_WIA_KEY_TAG;
    const wiaCryptoContext = createCryptoContextFor(wiaKeytag);
    return yield* call(() => [wia, wiaCryptoContext] as const);
  } else {
    throw new Error(`Unexpected action type: ${errorOrWia.type}`);
  }
}

/**
 * Helper function which gets the PID from the store and creates a crypto context for it.
 * @returns the PID and the crypto context.
 */
function* getPID(): Iterator<any, readonly [string, CryptoContext]> {
  const maybePid = yield* select(ItwCredentialsPidSelector);
  if (O.isNone(maybePid)) {
    const message = `Expecting response_code from sendAuthorizationResponse, received undefined`;
    throw new Error(message);
  }
  const pidCryptoContext = createCryptoContextFor(ITW_PID_KEY_TAG);
  return yield* call(
    () => [maybePid.value.credential, pidCryptoContext] as const
  );
}
