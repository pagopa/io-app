import { SagaIterator } from "redux-saga";
import { apply, call, put, select, take } from "typed-redux-saga/macro";
import { sign } from "@pagopa/io-react-native-crypto";
import { SignJWT } from "@pagopa/io-react-native-jwt";
import { ActionType, getType } from "typesafe-actions";
import {
  RelyingPartySolution,
  WalletInstanceAttestation
} from "@pagopa/io-react-native-wallet";
import { itwRpInitialization } from "../store/actions/itwRpActions";
import { ItWalletErrorTypes } from "../utils/errors/itwErrors";
import { ITW_WIA_KEY_TAG } from "../utils/wia";
import { itwDecodePid } from "../store/actions/itwCredentialsActions";
import { itwWiaRequest } from "../store/actions/itwWiaActions";
import { ItwCredentialsPidSelector } from "../store/reducers/itwCredentialsReducer";

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

    // Decode PID
    const pid = yield* select(ItwCredentialsPidSelector);
    yield* put(itwDecodePid.request(pid));
    const decodedRes = yield* take<
      ActionType<typeof itwDecodePid.success | typeof itwDecodePid.failure>
    >([itwDecodePid.success, itwDecodePid.failure]);
    if (decodedRes.type === getType(itwDecodePid.failure)) {
      throw new Error(); // TODO: Better error mapping
    }
    const decodedWIA = yield* call(
      WalletInstanceAttestation.decode,
      wia.payload
    );
    const RP = new RelyingPartySolution(clientId, wia.payload);
    const unsignedDPoP = yield* apply(RP, RP.getUnsignedWalletInstanceDPoP, [
      decodedWIA.payload.cnf.jwk,
      authReqUrl
    ]);
    const signedDPoP = yield* call(sign, unsignedDPoP, ITW_WIA_KEY_TAG);
    const entity = yield* apply(RP, RP.getEntityConfiguration, []);
    const signedPayload = yield* call(
      SignJWT.appendSignature,
      unsignedDPoP,
      signedDPoP
    );
    const requestObject = yield* apply(RP, RP.getRequestObject, [
      signedPayload,
      authReqUrl,
      entity
    ]);
    yield* put(itwRpInitialization.success({ requestObject, entity }));
  } catch (e) {
    yield* put(
      itwRpInitialization.failure({
        code: ItWalletErrorTypes.RP_INITIALIZATION_ERROR
      })
    );
  }
}
