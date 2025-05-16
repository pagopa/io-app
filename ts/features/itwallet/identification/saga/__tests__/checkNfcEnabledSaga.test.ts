import { testSaga } from "redux-saga-test-plan";
import { itwNfcIsEnabled } from "../../store/actions";
import * as cieUtils from "../../../../authentication/login/cie/utils/cie";
import { checkNfcEnabledSaga } from "..";

describe("checkNfcEnabledSaga", () => {
  test.each([true, false])(
    "If isNFCEnabled returns %p, should update the state accordingly",
    arg => {
      testSaga(checkNfcEnabledSaga)
        .next()
        .call(cieUtils.isNfcEnabled)
        .next(arg)
        .put(itwNfcIsEnabled.success(arg))
        .next()
        .isDone();
    }
  );
});
