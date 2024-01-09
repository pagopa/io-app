import { SagaIterator } from "redux-saga";
import { call, put, select, take } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import {
  Credential,
  createCryptoContextFor,
  Trust
} from "@pagopa/io-react-native-wallet";
import { itwRpInitialization } from "../store/actions/itwRpActions";
import { ItWalletErrorTypes } from "../utils/itwErrorsUtils";
import { itwWiaRequest } from "../store/actions/itwWiaActions";
import { itwLifecycleIsValidSelector } from "../store/reducers/itwLifecycleReducer";
import { ITW_WIA_KEY_TAG } from "../utils/itwSecureStorageUtils";

/*
 * This saga handles the RP initialization.
 * It calls the getRequestObject method of the RP solution
 */
export function* handleItwRpInitializationSaga(
  action: ActionType<typeof itwRpInitialization.request>
): SagaIterator {
  try {
    // Check if the lifecycle is valid
    const isItwLifecycleValid = yield* select(itwLifecycleIsValidSelector);
    if (!isItwLifecycleValid) {
      yield* put(
        itwRpInitialization.failure({
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
      itwRpInitialization.success({
        requestObject,
        entity: rpEntityConfiguration,
        authReqUrl,
        clientId
      })
    );
  } catch (e) {
    yield* put(
      itwRpInitialization.failure({
        code: ItWalletErrorTypes.RP_INITIALIZATION_ERROR
      })
    );
  }
}
