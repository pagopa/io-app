import { IOToast } from "@pagopa/io-app-design-system";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { withRefreshApiCall } from "../../../fastLogin/saga/utils";
import { FimsHistoryClient } from "../api/client";
import { fimsHistoryExport } from "../store/actions";
import { SagaCallReturnType } from "../../../../types/utils";

export function* handleExportFimsHistorySaga(
  exportHistory: FimsHistoryClient["exports"],
  bearerToken: string,
  action: ActionType<typeof fimsHistoryExport.request>
) {
  const exportHistoryRequest = exportHistory({
    Bearer: bearerToken
  });

  try {
    const exportHistoryResult = (yield* call(
      withRefreshApiCall,
      exportHistoryRequest,
      action
    )) as SagaCallReturnType<typeof exportHistory>;

    const actionToPut = pipe(
      exportHistoryResult,
      E.foldW(
        _failure => {
          IOToast.error(`failure: ${_failure.toLocaleString()}`);
          return fimsHistoryExport.failure("FAIL");
        },
        success => {
          switch (success.status) {
            case 202:
              IOToast.success(`success: ${success.status}`);
              break;
            case 409:
              IOToast.info(`exporting: ${success.status}`);
              break;
            default:
              IOToast.error(`unknown status: ${success.status}`);
              break;
          }
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
