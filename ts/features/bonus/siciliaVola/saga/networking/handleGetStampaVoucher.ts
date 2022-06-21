import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import * as E from "fp-ts/lib/Either";
import { Platform } from "react-native";
import RNFS from "react-native-fs";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { MitVoucherToken } from "../../../../../../definitions/io_sicilia_vola_token/MitVoucherToken";
import { SagaCallReturnType } from "../../../../../types/utils";
import { waitBackoffError } from "../../../../../utils/backoffError";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { SessionManager } from "../../../../../utils/SessionManager";
import { BackendSiciliaVolaClient } from "../../api/backendSiciliaVola";
import { svGetPdfVoucher } from "../../store/actions/voucherGeneration";
import { svPossibleVoucherStateGet } from "../../store/actions/voucherList";

/**
 * Handle the remote call that allows the user to download and save the voucher
 */
export function* handleGetStampaVoucher(
  getStampaVoucher: ReturnType<
    typeof BackendSiciliaVolaClient
  >["getStampaVoucher"],
  svSessionManager: SessionManager<MitVoucherToken>,
  action: ActionType<typeof svGetPdfVoucher.request>
) {
  const fPath = Platform.select({
    ios: RNFS.DocumentDirectoryPath,
    default: RNFS.DownloadDirectoryPath
  });

  const voucherFilename = "sicilia_vola";

  try {
    yield* call(waitBackoffError, svGetPdfVoucher.failure);
    const request = svSessionManager.withRefresh(
      getStampaVoucher({ codiceVoucher: action.payload })
    );
    const getStampaVoucherResult: SagaCallReturnType<typeof request> =
      yield* call(request);

    if (E.isRight(getStampaVoucherResult)) {
      if (getStampaVoucherResult.right.status === 200) {
        try {
          yield* call(
            RNFS.writeFile,
            `${fPath}/${voucherFilename}.pdf`,
            getStampaVoucherResult.right.value.data,
            "base64"
          );
          yield* put(svGetPdfVoucher.success(fPath));
        } catch (e) {
          yield* put(svPossibleVoucherStateGet.failure(getNetworkError(e)));
        }

        return;
      }

      yield* put(
        svGetPdfVoucher.failure(
          getGenericError(
            new Error(`response status ${getStampaVoucherResult.right.status}`)
          )
        )
      );
      return;
    }
    yield* put(
      svPossibleVoucherStateGet.failure(
        getGenericError(new Error(readableReport(getStampaVoucherResult.left)))
      )
    );
  } catch (e) {
    yield* put(svGetPdfVoucher.failure(getNetworkError(e)));
  }
}
