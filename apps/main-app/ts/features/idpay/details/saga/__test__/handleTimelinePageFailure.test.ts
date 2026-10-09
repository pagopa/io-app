import { testSaga } from "redux-saga-test-plan";

import { NetworkError } from "../../../../../utils/errors";
import { trackIDPayDetailTimelineError } from "../../analytics";
import { idpayTimelinePageGet } from "../../store/actions";
import { handleTimelinePageFailure } from "../handleTimelinePageFailure";

const initiativeId = "abcdef";
const error: NetworkError = { kind: "timeout" };

describe("handleTimelinePageFailure", () => {
  it("should track IDPAY_DETAIL_TIMELINE_ERROR with the failed initiative and error", () => {
    testSaga(
      handleTimelinePageFailure,
      idpayTimelinePageGet.failure({ initiativeId, error })
    )
      .next()
      .call(trackIDPayDetailTimelineError, {
        initiative_id: initiativeId,
        error
      })
      .next()
      .isDone();
  });
});
