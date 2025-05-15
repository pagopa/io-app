import { testSaga } from "redux-saga-test-plan";
import { itwNfcIsEnabled } from "../../store/actions";
import * as cieUtils from "../../../../authentication/login/cie/utils/cie";
import { handleNfcEnabledSaga } from "../handleNfcEnabledSaga";

describe("handleNfcEnabledSaga", () => {
  test.each([true, false])(
    "If isNFCEnabled returns %p, should update the state accordingly",
    arg => {
      testSaga(handleNfcEnabledSaga)
        .next()
        .call(cieUtils.isNfcEnabled)
        .next(arg)
        .put(itwNfcIsEnabled.success(arg))
        .next()
        .isDone();
    }
  );
});
