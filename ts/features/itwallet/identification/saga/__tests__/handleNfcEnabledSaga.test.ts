import { testSaga } from "redux-saga-test-plan";
import { itwIsNfcEnabled } from "../../../common/utils/itwCieUtils";
import { itwNfcIsEnabled } from "../../store/actions";
import { handleNfcEnabledSaga } from "../handleNfcEnabledSaga";

describe("handleNfcEnabledSaga", () => {
  test.each([true, false])(
    "If isNFCEnabled returns %p, should update the state accordingly",
    arg => {
      testSaga(handleNfcEnabledSaga)
        .next()
        .call(itwIsNfcEnabled)
        .next(arg)
        .put(itwNfcIsEnabled.success(arg))
        .next()
        .isDone();
    }
  );
});
