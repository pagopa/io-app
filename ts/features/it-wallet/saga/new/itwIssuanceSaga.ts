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

import { pipe } from "fp-ts/lib/function";
import { walletProviderUrl } from "../../../../config";
import {
  itwCancelIssuance,
  itwCancelStoreCredential,
  itwConfirmIssuance,
  itwConfirmStoreCredential,
  itwIssuanceChecks,
  itwIssuanceUserAuthorization,
  itwStartIssuanceFlow
} from "../../store/actions/new/itwIssuanceActions";
import { ITW_PID_KEY_TAG } from "../../utils/pid";
import { ItWalletErrorTypes } from "../../utils/errors/itwErrors";
import { ITW_WIA_KEY_TAG } from "../../utils/wia";

import { itwWiaRequest } from "../../store/actions/itwWiaActions";
import { ItwCredentialsPidSelector } from "../../store/reducers/itwCredentialsReducer";
import { getOrGenerateCyptoKey } from "../../utils/keychain";
import { itwCredentialsAddCredential } from "../../store/actions/itwCredentialsActions";
import { defaultDisplayData, getFromCatalog } from "../../utils/mocks";

export function* watchItwIssuanceSaga(): SagaIterator {
  yield* takeLatest(itwStartIssuanceFlow.request, itwIssuanceSaga);
}

export function* itwIssuanceSaga({
  payload: { credentialType, issuerUrl }
}: ActionType<typeof itwStartIssuanceFlow.request>): SagaIterator {
  /**
   * Setup phase
   */
  yield* put(itwIssuanceChecks.request({ credentialType, issuerUrl }));
  const [walletInstanceAttestation, wiaCryptoContext] = yield* call(
    getWalletInstanceAttestation
  );
  const credentialKeytag = `${Math.random()}`;
  yield* call(getOrGenerateCyptoKey, credentialKeytag);
  const credentialCryptoContext = createCryptoContextFor(credentialKeytag);

  // Issuer conf + trust
  const { issuerConf } = yield* call(
    Credential.Issuance.evaluateIssuerTrust,
    issuerUrl
  );

  const mockDisplayData = pipe(
    getFromCatalog(credentialType),
    O.map(_ => ({
      title: _.title,
      textColor: _.textColor,
      image: _.image,
      icon: _.icon
    })),
    O.getOrElse(() => defaultDisplayData)
  );

  const [credentialConfigurationSchema] =
    issuerConf.openid_credential_issuer.credentials_supported
      .filter(_ => _.credential_definition.type.includes(credentialType))
      .map(_ => ({
        credentialSubject: _.credential_definition.credentialSubject,
        display: mockDisplayData
      }));

  if (!credentialConfigurationSchema) {
    const error = {
      code: ItWalletErrorTypes.CREDENTIALS_ADD_ERROR,
      message: `Cannot find configuration schema for credential of type ${credentialType}`
    };
    yield* put(itwIssuanceChecks.failure(error));
    yield* put(itwStartIssuanceFlow.failure(error));
    return;
  }

  yield* put(itwIssuanceChecks.success(true));
  const waitForConfirm = yield* take([itwCancelIssuance, itwConfirmIssuance]);
  if (isActionOf(itwCancelIssuance, waitForConfirm)) {
    yield* put(itwStartIssuanceFlow.cancel());
    return;
  }

  /**
   * User Authz phase
   */

  // from hard coded conf
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

  // complete user authz
  // Depending on credential type, use proper authz method
  /*   const completeUserAuthorization =
    // Authz by CIE login
    credentialType === PID_CREDENTIAL_TYPE
      ? () => call(completeUserAuthorizationWithCIE)
      : // Authz by PID presentation

        () =>
          call(completeUserAuthorizationWithPID, requestUri, issuerUrl, {
            wiaCryptoContext,
            walletInstanceAttestation
          }); */

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

  yield* put(
    itwIssuanceUserAuthorization.success({
      // TODO: export organization_name
      issuerName: "issuerConf.federation_entity.organization_name",
      credential,
      credentialType,
      parsedCredential,
      schema: credentialConfigurationSchema
    })
  );

  const waitForStoreConfirm = yield* take([
    itwConfirmStoreCredential,
    itwCancelStoreCredential
  ]);
  if (isActionOf(itwCancelStoreCredential, waitForStoreConfirm)) {
    yield* put(itwStartIssuanceFlow.cancel());
    return;
  }

  yield* put(
    itwCredentialsAddCredential.request({
      credential,
      format,
      keyTag: credentialKeytag,
      schema: credentialConfigurationSchema,
      parsedCredential
    })
  );
  const errorOrStoredCredential = yield* take([
    itwCredentialsAddCredential.failure,
    itwCredentialsAddCredential.success
  ]);
  if (
    isActionOf(itwCredentialsAddCredential.failure, errorOrStoredCredential)
  ) {
    throw errorOrStoredCredential.payload;
  }

  // close saga
  return yield* put(itwStartIssuanceFlow.success());
}

/* function* completeUserAuthorizationWithCIE(): Iterator<
  any,
  Awaited<ReturnType<Credential.Issuance.CompleteUserAuthorization>>
> {
  const code = yield* call(() => "stub");
  return { code };
} */

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

  // wait for user user confirmation
  yield* take(itwIssuanceUserAuthorization.request);

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
    yield* put(
      itwIssuanceUserAuthorization.failure({
        code: ItWalletErrorTypes.CREDENTIALS_ADD_ERROR,
        message
      })
    );
    throw new Error(message);
  }

  return { code: response_code };
}

function* confirmCredential(
  ..._args: Parameters<Credential.Issuance.ConfirmCredential>
): Iterator<any, boolean> {
  // show detail
  // take confirm action
  // take reject action

  // if action = reject
  //  boh

  // if action = confirm
  //  pin
  //  if pin ok
  //    return true
  //  else
  //    error pin

  return yield* call(() => true);
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
    yield* put(
      itwIssuanceUserAuthorization.failure({
        code: ItWalletErrorTypes.CREDENTIALS_ADD_ERROR,
        message
      })
    );
    throw new Error(message);
  }
  const pidKeytag = ITW_PID_KEY_TAG;
  const pidCryptoContext = createCryptoContextFor(pidKeytag);

  // return select WIA
  return yield* call(
    () => [maybePid.value.credential, pidCryptoContext] as const
  );
}
