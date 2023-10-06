import { SagaIterator } from "redux-saga";
import { put, select, call, takeLatest } from "typed-redux-saga/macro";
import { isSome } from "fp-ts/lib/Option";
import {
  Errors,
  getWalletProviderEntityConfiguration
} from "@pagopa/io-react-native-wallet";
import DeviceInfo from "react-native-device-info";
import { idpSelector } from "../../../store/reducers/authentication";
import { ItWalletErrorTypes } from "../utils/errors/itwErrors";
import { getWia } from "../utils/wia";
import { isCIEAuthenticationSupported } from "../utils/cie";
import { itwWiaRequest } from "../store/actions/itwWiaActions";
import { walletProviderUrl } from "../../../config";

/**
 * Watcher for the IT wallet instance attestation related sagas.
 */
export function* watchItwWiaSaga(): SagaIterator {
  /**
   * Handles the wallet instance attestation issuing.
   */
  yield* takeLatest(itwWiaRequest.request, handleWiaRequest);
}

/*
 * This saga handles the wallet instance attestation issuing.
 * Currently it checks if the user logged in with CIE or if the device has NFC support.
 * Then it tries to get the wallet instance attestation and dispatches the result.
 */
export function* handleWiaRequest(): SagaIterator {
  const idp = yield* select(idpSelector);
  const hasLoggedInWithCie = isSome(idp) && idp.value.name === "cie";
  const isCieSupported = yield* call(isCIEAuthenticationSupported);
  const isEmulator = yield* call(DeviceInfo.isEmulator);
  if (hasLoggedInWithCie || isCieSupported || isEmulator) {
    try {
      const entityConfiguration = yield* call(
        getWalletProviderEntityConfiguration,
        walletProviderUrl
      );
      const wia = yield* call(getWia, entityConfiguration);
      yield* put(itwWiaRequest.success(wia));
    } catch (e) {
      const { reason } = e as Errors.WalletInstanceAttestationIssuingError;
      yield* put(
        itwWiaRequest.failure({
          code: ItWalletErrorTypes.WIA_ISSUING_ERROR,
          message: reason
        })
      );
    }
  } else {
    yield* put(
      itwWiaRequest.failure({
        code: ItWalletErrorTypes.NFC_NOT_SUPPORTED
      })
    );
  }
}
