import { testSaga } from "redux-saga-test-plan";
import { CieUtils } from "@pagopa/io-react-native-cie";
import { itwHasNfcFeature } from "../../store/actions";
import { checkHasNfcFeatureSaga } from "..";

jest.mock("@pagopa/io-react-native-cie", () => ({
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
