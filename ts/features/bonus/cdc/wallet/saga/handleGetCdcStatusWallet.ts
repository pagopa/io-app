import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { CdcClient } from "../../common/api/client";
import { getCdcStatusWallet } from "../store/actions";
import { withRefreshApiCall } from "../../../../authentication/fastLogin/saga/utils";
import { SagaCallReturnType } from "../../../../../types/utils";
import { walletAddCards } from "../../../../wallet/store/actions/cards";
import { getNetworkError } from "../../../../../utils/errors";

export function* handleGetCdcStatusWallet(
  getCdcStatus: CdcClient["getStatus"],
  action: ActionType<(typeof getCdcStatusWallet)["request"]>
) {
  try {
    const cdcStatusRequest = getCdcStatus({});
    const cdcStatusResponse = (yield* call(
      withRefreshApiCall,
      cdcStatusRequest,
      action
    )) as unknown as SagaCallReturnType<typeof getCdcStatus>;
    if (E.isLeft(cdcStatusResponse)) {
      yield* put(
        getCdcStatusWallet.failure({
          kind: "generic",
          value: new Error(readableReport(cdcStatusResponse.left))
        })
      );
    } else if (
      E.isRight(cdcStatusResponse) &&
      cdcStatusResponse.right.status === 200
    ) {
      const cdcInfo = cdcStatusResponse.right.value;
      yield* put(
        walletAddCards([
          {
            type: "cdc",
            category: "bonus",
            key: "cdc_card",
            expireDate: cdcInfo.expiration_date,
            numberOfCards: cdcInfo.number_of_cards
          }
        ])
      );
      yield* put(getCdcStatusWallet.success(cdcInfo));
    } else if (cdcStatusResponse.right.status === 401) {
      yield* put(getCdcStatusWallet.cancel());
    } else {
      yield* put(
        getCdcStatusWallet.failure({
          kind: "generic",
          value: new Error(`response status ${cdcStatusResponse.right.status}`)
        })
      );
    }
  } catch (e) {
    yield* put(getCdcStatusWallet.failure(getNetworkError(e)));
  }
}
