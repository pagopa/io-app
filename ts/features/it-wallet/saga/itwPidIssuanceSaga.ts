import { SagaIterator } from "redux-saga";
import { call, put, select, takeLatest } from "typed-redux-saga/macro";
import { isSome } from "fp-ts/lib/Option";
import {
  Credential,
  createCryptoContextFor
} from "@pagopa/io-react-native-wallet";
import { ActionType } from "typesafe-actions";
import * as O from "fp-ts/lib/Option";
import { itwWiaSelector } from "../store/reducers/itwWiaReducer";
import { ItWalletErrorTypes } from "../utils/itwErrorsUtils";
import {
  itwCredentialsAddPid,
  itwPid
} from "../store/actions/itwCredentialsActions";
import { itwLifecycleValid } from "../store/actions/itwLifecycleActions";
import { walletProviderBaseUrl } from "../../../config";
import {
  ITW_PID_KEY_TAG,
  ITW_WIA_KEY_TAG,
  getOrGenerateCyptoKey
} from "../utils/itwSecureStorageUtils";
import { verifyPin } from "./itwSagaUtils";

/**
 * A dummy implementation of CompleteUserAuthorization that uses static values.
 * Used to replace unimplemented specifications by the Issuer
 * Waiting for the Issuer to implement CIE authorization
 * TODO: [SIW-630]
 */
const completeUserAuthorizationWithCIE: Credential.Issuance.CompleteUserAuthorization =
  async (_, __) => ({ code: "static_code" });

/**
 * Watcher for the IT wallet PID related sagas.
 */
export function* watchPidSaga(): SagaIterator {
  /**
   * Handles a PID issuing request.
   */
  yield* takeLatest(itwPid.request, handlePidRequest);

  /**
   * Handles adding a PID to the wallet.
   */
  yield* takeLatest(itwCredentialsAddPid.request, handleCredentialsAddPid);
}

/*
 * This saga handles the PID issuing.
 * It calls the getPid function to get an encoded PID.
 */
export function* handlePidRequest({
  payload: { type, issuerUrl, pidData, ...displayData }
}: ActionType<typeof itwPid.request>): SagaIterator {
  try {
    const wiaOption = yield* select(itwWiaSelector);
    if (isSome(wiaOption)) {
      const walletInstanceAttestation = wiaOption.value;

      const wiaCryptoContext = yield* call(
        createCryptoContextFor,
        ITW_WIA_KEY_TAG
      );

      const { issuerConf } = yield* call(
        Credential.Issuance.evaluateIssuerTrust,
        issuerUrl
      );

      const [credentialConfigurationSchema] =
        issuerConf.openid_credential_issuer.credentials_supported
          .filter(_ => _.format === "vc+sd-jwt")
          .filter(_ => _.credential_definition.type.includes(type))
          .map(_ => _.credential_definition.credentialSubject);
      if (!credentialConfigurationSchema) {
        throw new Error(
          `Cannot find configuration schema for credential of type ${type}`
        );
      }

      // Auth Token request
      const { clientId, requestUri } = yield* call(
        Credential.Issuance.startUserAuthorization,
        issuerConf,
        type,
        {
          walletInstanceAttestation,
          walletProviderBaseUrl,
          wiaCryptoContext,
          additionalParams:
            // TODO: [SIW-630] do not pass CIE data
            {
              birth_date: pidData.birthDate,
              fiscal_code: pidData.fiscalCode,
              name: pidData.name,
              surname: pidData.surname
            }
        }
      );

      // Perform strong user authorization to the PID Issuer
      const { code } = yield* call(
        completeUserAuthorizationWithCIE,
        requestUri,
        clientId
      );

      // Authorize the User to access the resource (Credential)
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

      // Generate fresh key for PID binding
      // ensure the key esists befor starting the issuing process
      yield* call(getOrGenerateCyptoKey, ITW_PID_KEY_TAG);
      const credentialCryptoContext = createCryptoContextFor(ITW_PID_KEY_TAG);

      const { credential, format } = yield* call(
        Credential.Issuance.obtainCredential,
        issuerConf,
        accessToken,
        nonce,
        clientId,
        type,
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
        itwPid.success({
          issuerConf,
          keyTag: ITW_PID_KEY_TAG,
          credential,
          format,
          parsedCredential,
          credentialConfigurationSchema,
          displayData,
          credentialType: type
        })
      );
    } else {
      yield* put(
        itwPid.failure({
          code: ItWalletErrorTypes.PID_ISSUING_ERROR
        })
      );
    }
  } catch (err) {
    yield* put(
      itwPid.failure({
        code: ItWalletErrorTypes.PID_ISSUING_ERROR
      })
    );
  }
}

/*
 * This saga handles adding a PID to the wallet.
 * As a side effect, it sets the lifecycle of the wallet to valid.
 */
export function* handleCredentialsAddPid(
  action: ActionType<typeof itwCredentialsAddPid.request>
): SagaIterator {
  yield* call(verifyPin);
  const pid = action.payload;
  if (O.isSome(pid)) {
    yield* put(itwCredentialsAddPid.success(pid.value));
    yield* put(itwLifecycleValid());
  } else {
    yield* put(
      itwCredentialsAddPid.failure({
        code: ItWalletErrorTypes.CREDENTIAL_ADD_ERROR
      })
    );
  }
}
