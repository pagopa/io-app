import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../types/utils";
import { withRefreshApiCall } from "../../../fastLogin/saga/utils";
import { FimsHistoryClient } from "../api/client";
import { fimsHistoryExport } from "../store/actions";

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

    const resultAction = pipe(
      exportHistoryResult,
      E.foldW(
        _failure => fimsHistoryExport.failure(),
        success => {
          switch (success.status) {
            case 202:
              return fimsHistoryExport.success("SUCCESS");
            case 409:
              return fimsHistoryExport.success("ALREADY_EXPORTING");
            default:
              return fimsHistoryExport.failure();
          }
        }
      )
    );

    yield* put(resultAction);
  } catch (e: any) {
    yield* put(fimsHistoryExport.failure());
  }
}
