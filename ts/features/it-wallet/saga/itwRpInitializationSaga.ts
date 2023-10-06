import { SagaIterator } from "redux-saga";
import { call, put, take } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import {
  RelyingPartySolution,
  createCryptoContextFor,
  getRelyingPartyEntityConfiguration
} from "@pagopa/io-react-native-wallet";
import { itwRpInitialization } from "../store/actions/itwRpActions";
import { ItWalletErrorTypes } from "../utils/errors/itwErrors";
import { ITW_WIA_KEY_TAG } from "../utils/wia";
import { itwWiaRequest } from "../store/actions/itwWiaActions";

/*
 * This saga handles the RP initialization.
 * It calls the getRequestObject method of the RP solution
 */
export function* handleItwRpInitializationSaga(
  action: ActionType<typeof itwRpInitialization.request>
): SagaIterator {
  try {
    const { authReqUrl, clientId } = action.payload;

    // Get WIA
    yield* put(itwWiaRequest.request());
    const wia = yield* take(itwWiaRequest.success);

    // Create crypto context
    const wiaCryptoContext = createCryptoContextFor(ITW_WIA_KEY_TAG);

    // Get entity configuration for RP
    const entity = yield* call(getRelyingPartyEntityConfiguration, clientId);

    // Get request object configuration
    const requestObject = yield* call(
      RelyingPartySolution.getRequestObject({ wiaCryptoContext }),
      wia.payload,
      authReqUrl,
      entity
    );

    yield* put(itwRpInitialization.success({ requestObject, entity }));
  } catch (e) {
    yield* put(
      itwRpInitialization.failure({
        code: ItWalletErrorTypes.RP_INITIALIZATION_ERROR
      })
    );
  }
}
