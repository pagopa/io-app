import { testSaga } from "redux-saga-test-plan";
import { CieUtils } from "@pagopa/io-react-native-cie";
import { itwHasNfcFeature } from "../../store/actions";
import { checkHasNfcFeatureSaga } from "..";

describe("checkHasNfcFeatureSaga", () => {
  test.each([true, false])(
    "If hasNFCFeature returns %p, should update the state accordingly",
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
