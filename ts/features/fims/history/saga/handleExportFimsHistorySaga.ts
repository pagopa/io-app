import { IOToast } from "@pagopa/io-app-design-system";
import * as E from "fp-ts/lib/Either";
import { constNull, pipe } from "fp-ts/lib/function";
import { Alert } from "react-native";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import I18n from "../../../../i18n";
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

    yield* pipe(
      exportHistoryResult,
      E.foldW(
        failure => {
          IOToast.error(I18n.t("FIMS.history.exportData.errorToast"));
          return put(fimsHistoryExport.failure(JSON.stringify(failure)));
        },
        success => {
          switch (success.status) {
            case 202:
              IOToast.success(I18n.t("FIMS.history.exportData.successToast"));
              break;
            case 409:
              Alert.alert(
                I18n.t("FIMS.history.exportData.alerts.alreadyExporting.title"),
                I18n.t("FIMS.history.exportData.alerts.alreadyExporting.body"),
                [{ text: I18n.t("global.buttons.ok"), onPress: constNull }]
              );
              break;
            default:
              IOToast.error(I18n.t("FIMS.history.exportData.errorToast"));
              break;
          }
          return put(fimsHistoryExport.success());
        }
      )
    );
  } catch (e: any) {
    yield* put(fimsHistoryExport.failure(e.toString()));
  }
}
