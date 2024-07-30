import { IOToast } from "@pagopa/io-app-design-system";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { withRefreshApiCall } from "../../../fastLogin/saga/utils";
import { FimsHistoryClient } from "../api/client";
import { fimsHistoryExport } from "../store/actions";

export function* handleExportFimsHistorySaga(
  exportHistory: FimsHistoryClient["exports"],
  bearerToken: string
  // _action: ActionType<typeof fimsHistoryExport.request>
) {
  const exportHistoryRequest = exportHistory({
    Bearer: bearerToken
  });

  try {
    const exportHistoryResult = yield* call(
      withRefreshApiCall,
      exportHistoryRequest
    );

    const actionToPut = pipe(
      exportHistoryResult,
      E.foldW(
        _failure => {
          IOToast.error("failure");
          return fimsHistoryExport.failure("FAIL");
        },
        _success => {
          IOToast.show("success");
          return fimsHistoryExport.success();
        }
      )
    );

    yield* put(actionToPut);
  } catch (e: any) {
    IOToast.error(JSON.stringify(e));
    yield* put(fimsHistoryExport.failure(e.toString()));
  }
}
