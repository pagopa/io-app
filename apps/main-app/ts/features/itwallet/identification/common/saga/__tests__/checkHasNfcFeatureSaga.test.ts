import { CieUtils } from "@io-app/expo-cie";
import { testSaga } from "redux-saga-test-plan";

import { checkHasNfcFeatureSaga } from "..";
import { itwHasNfcFeature } from "../../store/actions";

jest.mock("@io-app/expo-cie", () => ({
  CieUtils: {
    hasNfcFeature: jest.fn()
  }
}));

describe("checkHasNfcFeatureSaga", () => {
  test.each([true, false])(
    "If hasNfcFeature returns %p, should update the state accordingly",
    arg => {
      testSaga(checkHasNfcFeatureSaga)
        .next()
        .call(CieUtils.hasNfcFeature)
        .next(arg)
        .put(itwHasNfcFeature.success(arg))
        .next()
        .isDone();
    }
  );
});
