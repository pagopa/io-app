import { SagaIterator } from "redux-saga";
import { call, put, select, take, takeLatest } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import {
  Trust,
  createCryptoContextFor,
  Credential
} from "@pagopa/io-react-native-wallet";
import * as O from "fp-ts/lib/Option";
import {
  itwPrRemotePidInit,
  itwPrRemotePidPresentation
} from "../store/actions/itwPrRemotePidActions";
import { itwPrRemotePidInitValueSelector } from "../store/reducers/itwPrRemotePidReducer";
import { itwPersistedCredentialsValuePidSelector } from "../store/reducers/itwPersistedCredentialsReducer";
import {
  ITW_PID_KEY_TAG,
  ITW_WIA_KEY_TAG
} from "../utils/itwSecureStorageUtils";
import { itwWiaSelector } from "../store/reducers/itwWiaReducer";
import { ItWalletErrorTypes } from "../utils/itwErrorsUtils";
import { verifyPin } from "../utils/itwSagaUtils";
import { itwLifecycleIsValidSelector } from "../store/reducers/itwLifecycleReducer";
import { itwWiaRequest } from "../store/actions/itwWiaActions";

/**
 * Watcher for the IT wallet Relying Party related sagas.
 */
export function* watchItwPrRemotePid(): SagaIterator {
  /**
   * Handles the PID remote presentation initialization flow to an RP.
   */
  yield* takeLatest(itwPrRemotePidInit.request, handleItwPrRemotePidInitSaga);

  /**
   * Handles the PID remote presentation flow to an RP.
   */
  yield* takeLatest(
    itwPrRemotePidPresentation.request,
    handleItwPrRemotePidSaga
  );
}

/*
 * This saga handles the RP initialization.
 * It calls the getRequestObject method of the RP solution
 */
export function* handleItwPrRemotePidInitSaga(
  action: ActionType<typeof itwPrRemotePidInit.request>
): SagaIterator {
  try {
    // Check if the lifecycle is valid
    const isItwLifecycleValid = yield* select(itwLifecycleIsValidSelector);
    if (!isItwLifecycleValid) {
      yield* put(
        itwPrRemotePidInit.failure({
          code: ItWalletErrorTypes.WALLET_NOT_VALID_ERROR
        })
      );
      return;
    }

    const { authReqUrl, clientId } = action.payload;

    // Get WIA
    yield* put(itwWiaRequest.request());
    const wia = yield* take(itwWiaRequest.success);

    // Create crypto context
    const wiaCryptoContext = createCryptoContextFor(ITW_WIA_KEY_TAG);

    // Get entity configuration for RP
    const {
      payload: { metadata: rpEntityConfiguration }
    } = yield* call(Trust.getRelyingPartyEntityConfiguration, clientId);

    // Get request object configuration
    const { requestObject } = yield* call(
      Credential.Presentation.getRequestObject,
      authReqUrl,
      rpEntityConfiguration,
      {
        wiaCryptoContext,
        walletInstanceAttestation: wia.payload
      }
    );

    yield* put(
      itwPrRemotePidInit.success({
        requestObject,
        rpEntityConfiguration
      })
    );
  } catch (e) {
    yield* put(
      itwPrRemotePidInit.failure({
        code: ItWalletErrorTypes.RP_INITIALIZATION_ERROR
      })
    );
  }
}

/*
 * This saga handles the RP presentation.
 * It calls the sendAuthorizationResponse method of the RP solution
 */
export function* handleItwPrRemotePidSaga(
  _: ActionType<typeof itwPrRemotePidPresentation.request>
): SagaIterator {
  try {
    yield* call(verifyPin);

    // TODO: this claims should be selected by user
    const claims = [
      "unique_id",
      "given_name",
      "family_name",
      "birthdate",
      "place_of_birth",
      "tax_id_number",
      "evidence"
    ];

    const maybeInitValue = yield* select(itwPrRemotePidInitValueSelector);

    const pidToken = yield* select(itwPersistedCredentialsValuePidSelector);

    if (O.isNone(maybeInitValue) || O.isNone(pidToken)) {
      throw new Error("Request object is not defined");
    } else {
      // Create PID crypto context
      const pidCryptoContext = createCryptoContextFor(ITW_PID_KEY_TAG);

      // We suppose the WIA has already been loaded into the state from previous steps
      const maybeWalletInstanceAttestation = yield* select(itwWiaSelector);

      if (O.isNone(maybeWalletInstanceAttestation)) {
        throw new Error("WalletInstanceAttestation is not defined");
      }

      const walletInstanceAttestation = maybeWalletInstanceAttestation.value;

      const { requestObject, rpEntityConfiguration } = maybeInitValue.value;

      // Submit authorization response
      const result = yield* call(
        Credential.Presentation.sendAuthorizationResponse,
        requestObject,
        rpEntityConfiguration,
        [pidToken.value.credential, claims, pidCryptoContext],
        {
          walletInstanceAttestation
        }
      );

      yield* put(itwPrRemotePidPresentation.success(result));
    }
  } catch (e) {
    yield* put(
      itwPrRemotePidPresentation.failure({
        code: ItWalletErrorTypes.RP_PRESENTATION_ERROR
      })
    );
  }
}
