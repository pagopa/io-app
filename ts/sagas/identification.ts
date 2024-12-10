import { call, put, select, take, takeLatest } from "typed-redux-saga/macro";
import { ActionType, getType } from "typesafe-actions";
import * as O from "fp-ts/lib/Option";
import { startApplicationInitialization } from "../store/actions/application";
import {
  checkCurrentSession,
  sessionInvalid
} from "../store/actions/authentication";
import {
  identificationCancel,
  identificationForceLogout,
  identificationPinReset,
  identificationRequest,
  identificationReset,
  identificationStart,
  identificationSuccess
} from "../store/actions/identification";
import {
  IdentificationCancelData,
  IdentificationGenericData,
  IdentificationResult,
  IdentificationSuccessData
} from "../store/reducers/identification";
import { PinString } from "../types/PinString";
import { ReduxSagaEffect, SagaCallReturnType } from "../types/utils";
import { deletePin, getPin } from "../utils/keychain";
import { handlePendingMessageStateIfAllowed } from "../features/pushNotifications/sagas/common";
import { isFastLoginEnabledSelector } from "./../features/fastLogin/store/selectors/index";

type ResultAction =
  | ActionType<typeof identificationCancel>
  | ActionType<typeof identificationPinReset>
  | ActionType<typeof identificationForceLogout>
  | ActionType<typeof identificationSuccess>;
// Wait the identification and return the result
function* waitIdentificationResult(): Generator<
  ReduxSagaEffect,
  void | IdentificationResult,
  any
> {
  const resultAction = yield* take<ResultAction>([
    identificationCancel,
    identificationPinReset,
    identificationForceLogout,
    identificationSuccess
  ]);

  switch (resultAction.type) {
    case getType(identificationCancel):
      return IdentificationResult.cancel;

    case getType(identificationPinReset): {
      // Invalidate the session
      yield* put(sessionInvalid());

      // Delete the unlock code

      yield* call(deletePin);

      // Hide the identification screen
      yield* put(identificationReset());

      return IdentificationResult.pinreset;
    }

    case getType(identificationSuccess): {
      // if the identification has been successfully, check if the current session is still valid
      const isFastLoginEnabled = yield* select(isFastLoginEnabledSelector);
      if (!isFastLoginEnabled) {
        yield* put(checkCurrentSession.request());
      }
      return IdentificationResult.success;
    }

    case getType(identificationForceLogout): {
      yield* put(sessionInvalid());
      yield* put(identificationReset());
      return IdentificationResult.pinreset;
    }

    default: {
      ((): never => resultAction)();
    }
  }
}

/**
 * If you need to start the identification process and wait the result in a "sync" way,
 * like we do in the startup saga, use this generator
 */
export function* startAndReturnIdentificationResult(
  pin: PinString,
  canResetPin: boolean = true,
  isValidatingTask: boolean = false,
  identificationGenericData?: IdentificationGenericData,
  identificationCancelData?: IdentificationCancelData,
  identificationSuccessData?: IdentificationSuccessData,
  shufflePad: boolean = false
): Generator<
  ReduxSagaEffect,
  SagaCallReturnType<typeof waitIdentificationResult>,
  never
> {
  yield* put(
    identificationStart(
      pin,
      canResetPin,
      isValidatingTask,
      identificationGenericData,
      identificationCancelData,
      identificationSuccessData,
      shufflePad
    )
  );

  return yield* call(waitIdentificationResult);
}

// Started by redux action
function* startAndHandleIdentificationResult(
  identificationRequestAction: ActionType<typeof identificationRequest>
) {
  const pin: SagaCallReturnType<typeof getPin> = yield* call(getPin);
  if (O.isNone(pin)) {
    return;
  }
  yield* put(
    identificationStart(
      pin.value,
      identificationRequestAction.payload.canResetPin,
      identificationRequestAction.payload.isValidatingTask,
      identificationRequestAction.payload.identificationGenericData,
      identificationRequestAction.payload.identificationCancelData,
      identificationRequestAction.payload.identificationSuccessData,
      identificationRequestAction.payload.shufflePad
    )
  );
  const identificationResult = yield* call(waitIdentificationResult);

  if (identificationResult === IdentificationResult.pinreset) {
    yield* put(startApplicationInitialization());
  } else if (identificationResult === IdentificationResult.success) {
    // Check if we have a pending notification message
    yield* call(handlePendingMessageStateIfAllowed);
  }
}

export function* watchIdentification(): IterableIterator<ReduxSagaEffect> {
  // Watch for identification request
  yield* takeLatest(
    getType(identificationRequest),
    startAndHandleIdentificationResult
  );
}
