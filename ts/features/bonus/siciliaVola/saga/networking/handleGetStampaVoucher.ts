import { ActionType } from "typesafe-actions";
import { call, put } from "typed-redux-saga";
import { Platform } from "react-native";
import RNFS from "react-native-fs";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { SessionManager } from "../../../../../utils/SessionManager";
import { MitVoucherToken } from "../../../../../../definitions/io_sicilia_vola_token/MitVoucherToken";
import { SagaCallReturnType } from "../../../../../types/utils";
import { BackendSiciliaVolaClient } from "../../api/backendSiciliaVola";
import { svGetPdfVoucher } from "../../store/actions/voucherGeneration";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { svPossibleVoucherStateGet } from "../../store/actions/voucherList";
import { waitBackoffError } from "../../../../../utils/backoffError";

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

    if (getStampaVoucherResult.isRight()) {
      if (getStampaVoucherResult.value.status === 200) {
        try {
          yield* call(
            RNFS.writeFile,
            `${fPath}/${voucherFilename}.pdf`,
            getStampaVoucherResult.value.value.data,
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
            new Error(`response status ${getStampaVoucherResult.value.status}`)
          )
        )
      );
      return;
    }
    yield* put(
      svPossibleVoucherStateGet.failure(
        getGenericError(new Error(readableReport(getStampaVoucherResult.value)))
      )
    );
  } catch (e) {
    yield* put(svGetPdfVoucher.failure(getNetworkError(e)));
  }
}
