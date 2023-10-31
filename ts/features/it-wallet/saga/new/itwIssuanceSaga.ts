import { SagaIterator } from "redux-saga";
import {
  call,
  delay,
  put,
  select,
  take,
  takeLatest
} from "typed-redux-saga/macro";
import * as O from "fp-ts/lib/Option";
import {
  Credential,
  createCryptoContextFor
} from "@pagopa/io-react-native-wallet";
import { CryptoContext } from "@pagopa/io-react-native-jwt";
import { ActionType, isActionOf } from "typesafe-actions";

import { walletProviderUrl } from "../../../../config";
import {
  itwCancelIssuance,
  itwConfirmIssuance,
  itwIssuanceChecks,
  itwIssuanceUserAuthorization,
  itwStartIssuanceFlow
} from "../../store/actions/new/itwIssuanceActions";
import { ITW_PID_KEY_TAG, PID_CREDENTIAL_TYPE } from "../../utils/pid";
import { itwPidValueSelector } from "../../store/reducers/itwPidReducer";
import { ItWalletErrorTypes } from "../../utils/errors/itwErrors";

export function* watchItwIssuanceSaga(): SagaIterator {
  yield* takeLatest(itwStartIssuanceFlow.request, itwIssuanceSaga);
}

export function* itwIssuanceSaga({
  payload: { credentialType, issuerUrl }
}: ActionType<typeof itwStartIssuanceFlow.request>): SagaIterator {
  /**
   * Setup phase
   */
  const [walletInstanceAttestation, wiaCryptoContext] = yield* call(
    getWalletInstanceAttestation
  );
  const credentialKeytag = `${Math.random()}`;
  const credentialCryptoContext = createCryptoContextFor(credentialKeytag);

  yield* put(itwIssuanceChecks.request({ credentialType, issuerUrl }));

  // Issuer conf + trust
  const { issuerConf } = yield* call(
    Credential.Issuance.evaluateIssuerTrust,
    issuerUrl
  );

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
  const completeUserAuthorization =
    // Authz by CIE login
    credentialType === PID_CREDENTIAL_TYPE
      ? call(completeUserAuthorizationWithCIE)
      : // Authz by PID presentation
        call(completeUserAuthorizationWithPID, requestUri, issuerUrl, {
          wiaCryptoContext,
          walletInstanceAttestation
        });
  const { code } = yield* completeUserAuthorization;

  yield* put(itwIssuanceUserAuthorization.success());

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

  // confirm cred
  const isConfirmed = yield* call(confirmCredential, credential, format);

  // store credential
  if (isConfirmed) {
    // yield* put(...)
  }

  // close saga
  return yield* put(itwStartIssuanceFlow.success());
}

function* completeUserAuthorizationWithCIE(): Iterator<
  any,
  Awaited<ReturnType<Credential.Issuance.CompleteUserAuthorization>>
> {
  const code = yield* call(() => "stub");
  return { code };
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
  // put action GET WIA
  // take ???
  const wiaKeytag = "";
  const wiaCryptoContext = createCryptoContextFor(wiaKeytag);
  // return select WIA
  return yield* call(() => ["wia", wiaCryptoContext] as const);
}

function* getPID(): Iterator<any, readonly [string, CryptoContext]> {
  const maybePid = yield* select(itwPidValueSelector);
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
  return yield* call(() => ["pid", pidCryptoContext] as const);
}
