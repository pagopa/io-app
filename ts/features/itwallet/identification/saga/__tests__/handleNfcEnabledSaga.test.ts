import { testSaga } from "redux-saga-test-plan";
import cieManager from "@pagopa/react-native-cie";
import { handleNfcEnabledSaga } from "../handleNfcEnabledSaga";
import { itwNfcIsEnabled } from "../../store/actions";

describe("handleNfcEnabledSaga", () => {
  test.each([true, false])(
    "If isNFCEnabled returns %p, should update the state accordingly",
    arg => {
      testSaga(handleNfcEnabledSaga)
        .next()
        .call(cieManager.isNFCEnabled)
        .next(arg)
        .put(itwNfcIsEnabled.success(arg))
        .next()
        .isDone();
    }
  );
});
