import cieManager from "@pagopa/react-native-cie";
import { testSaga } from "redux-saga-test-plan";
import { checkHasNfcFeatureSaga } from "..";
import { itwHasNfcFeature } from "../../../common/store/actions";

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
