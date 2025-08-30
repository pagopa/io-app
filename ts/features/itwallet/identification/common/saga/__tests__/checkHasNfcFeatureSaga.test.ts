import { testSaga } from "redux-saga-test-plan";
import cieManager from "@pagopa/react-native-cie";
import { itwHasNfcFeature } from "../../store/actions";
import { checkHasNfcFeatureSaga } from "..";

describe("checkHasNfcFeatureSaga", () => {
  test.each([true, false])(
    "If hasNFCFeature returns %p, should update the state accordingly",
    arg => {
      testSaga(checkHasNfcFeatureSaga)
        .next()
        .call(cieManager.hasNFCFeature)
        .next(arg)
        .put(itwHasNfcFeature.success(arg))
        .next()
        .isDone();
    }
  );
});
