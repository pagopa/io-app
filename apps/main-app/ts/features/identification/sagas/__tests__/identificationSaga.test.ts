import * as O from "fp-ts/lib/Option";
import { testSaga } from "redux-saga-test-plan";

import { testable as IdentificationSagaModule } from "../";
import { maybeHandlePendingBackgroundActions } from "../../../../sagas/backgroundActions";
import { startApplicationInitialization } from "../../../../store/actions/application";
import { PinString } from "../../../../types/PinString";
import { deletePin, getPin } from "../../../../utils/keychain";
import {
  checkCurrentSession,
  sessionInvalid
} from "../../../authentication/common/store/actions";
import { isFastLoginEnabledSelector } from "../../../authentication/fastLogin/store/selectors";
import {
  identificationCancel,
  identificationForceLogout,
  identificationPinReset,
  identificationRequest,
  identificationReset,
  identificationStart,
  identificationSuccess
} from "../../store/actions";
import { IdentificationResult } from "../../store/reducers";
import { startAndReturnIdentificationResult } from "../index";

const pin = "123456" as PinString;
const testableModule = IdentificationSagaModule!;

describe("Identification Saga", () => {
  describe("waitIdentificationResult", () => {
    it("should handle identificationCancel action", () => {
      testSaga(testableModule.waitIdentificationResult)
        .next()
        .take([
          identificationCancel,
          identificationPinReset,
          identificationForceLogout,
          identificationSuccess
        ])
        .next(identificationCancel())
        .returns(IdentificationResult.cancel);
    });

    it("should handle identificationPinReset action", () => {
      testSaga(testableModule.waitIdentificationResult)
        .next()
        .take([
          identificationCancel,
          identificationPinReset,
          identificationForceLogout,
          identificationSuccess
        ])
        .next(identificationPinReset())
        .put(sessionInvalid())
        .next()
        .call(deletePin)
        .next()
        .put(identificationReset())
        .next()
        .returns(IdentificationResult.pinreset);
    });

    it("should handle identificationSuccess action", () => {
      testSaga(testableModule.waitIdentificationResult)
        .next()
        .take([
          identificationCancel,
          identificationPinReset,
          identificationForceLogout,
          identificationSuccess
        ])
        .next(identificationSuccess({ isBiometric: true }))
        .select(isFastLoginEnabledSelector)
        .next(false)
        .put(checkCurrentSession.request())
        .next()
        .returns(IdentificationResult.success);
    });

    it("should handle identificationForceLogout action", () => {
      testSaga(testableModule.waitIdentificationResult)
        .next()
        .take([
          identificationCancel,
          identificationPinReset,
          identificationForceLogout,
          identificationSuccess
        ])
        .next(identificationForceLogout())
        .put(sessionInvalid())
        .next()
        .put(identificationReset())
        .next()
        .returns(IdentificationResult.pinreset);
    });

    it("should not handle unexpected action type", () => {
      testSaga(testableModule.waitIdentificationResult)
        .next()
        .take([
          identificationCancel,
          identificationPinReset,
          identificationForceLogout,
          identificationSuccess
        ])
        .next({ type: "UNKNOWN_ACTION" })
        .isDone();
    });
  });

  describe("startAndReturnIdentificationResult", () => {
    it("should start identification and wait for result", () => {
      testSaga(startAndReturnIdentificationResult, pin)
        .next()
        .put(
          identificationStart(
            pin,
            true,
            false,
            undefined,
            undefined,
            undefined,
            false
          )
        )
        .next()
        .call(testableModule.waitIdentificationResult)
        .next()
        .isDone();
    });

    it("should handle additional parameters", () => {
      const genericData = { message: "test" };
      const cancelData = { label: "test", onCancel: () => jest.fn() };
      const successData = { onSuccess: () => jest.fn() };
      testSaga(
        startAndReturnIdentificationResult,
        pin,
        false,
        true,
        genericData,
        cancelData,
        successData,
        true
      )
        .next()
        .put(
          identificationStart(
            pin,
            false,
            true,
            genericData,
            cancelData,
            successData,
            true
          )
        )
        .next()
        .call(testableModule.waitIdentificationResult)
        .next()
        .isDone();
    });
  });

  it("should handle identification success", () => {
    const action = identificationRequest();

    testSaga(testableModule.startAndHandleIdentificationResult, action)
      .next()
      .call(getPin)
      .next(O.some(pin))
      .put(
        identificationStart(
          pin,
          true,
          false,
          undefined,
          undefined,
          undefined,
          false
        )
      )
      .next()
      .call(testableModule.waitIdentificationResult)
      .next("success")
      .call(maybeHandlePendingBackgroundActions)
      .next()
      .isDone();
  });

  it("should handle pin reset", () => {
    const action = identificationRequest();

    testSaga(testableModule.startAndHandleIdentificationResult, action)
      .next()
      .call(getPin)
      .next(O.some(pin))
      .put(
        identificationStart(
          pin,
          true,
          false,
          undefined,
          undefined,
          undefined,
          false
        )
      )
      .next()
      .call(testableModule.waitIdentificationResult)
      .next("pinreset")
      .put(startApplicationInitialization())
      .next()
      .isDone();
  });

  it("should handle getPin returning none", () => {
    const action = identificationRequest();

    testSaga(testableModule.startAndHandleIdentificationResult, action)
      .next()
      .call(getPin)
      .next(O.none)
      .isDone();
  });

  it("should handle different payloads in identificationRequest", () => {
    const genericData = { message: "test" };
    const cancelData = { label: "test", onCancel: () => jest.fn() };
    const successData = { onSuccess: () => jest.fn() };

    const action = identificationRequest(
      false,
      true,
      genericData,
      cancelData,
      successData
    );

    testSaga(testableModule.startAndHandleIdentificationResult, action)
      .next()
      .call(getPin)
      .next(O.some(pin))
      .put(
        identificationStart(
          pin,
          false,
          true,
          genericData,
          cancelData,
          successData
        )
      )
      .next()
      .call(testableModule.waitIdentificationResult)
      .next("success")
      .call(maybeHandlePendingBackgroundActions)
      .next()
      .isDone();
  });
});
