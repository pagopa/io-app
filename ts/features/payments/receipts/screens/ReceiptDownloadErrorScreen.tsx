import * as pot from "@pagopa/ts-commons/lib/pot";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { paymentAnalyticsDataSelector } from "../../history/store/selectors";
import * as analytics from "../analytics";
import useReceiptFailureSupportModal from "../hooks/useReceiptFailureSupportModal";
import { walletReceiptPotSelector } from "../store/selectors";
import { mapDownloadReceiptErrorToOutcomeProps } from "../utils";
import { getNetworkError } from "../../../../utils/errors";

const ReceiptDownloadErrorScreen = () => {
  const transactionReceiptPot = useIOSelector(walletReceiptPotSelector);
  const navigate = useIONavigation();

  const receiptError = pot.isError(transactionReceiptPot)
    ? transactionReceiptPot.error
    : undefined;

  const { bottomSheet, present } = useReceiptFailureSupportModal(receiptError);

  const paymentAnalyticsData = useIOSelector(paymentAnalyticsDataSelector);

  const reason =
    receiptError && "code" in receiptError
      ? receiptError.code
      : getNetworkError(receiptError).kind;

  useOnFirstRender(() =>
    analytics.trackPaymentsDownloadReceiptError({
      organization_name: paymentAnalyticsData?.receiptOrganizationName,
      first_time_opening: paymentAnalyticsData?.receiptFirstTimeOpening,
      user: paymentAnalyticsData?.receiptUser,
      organization_fiscal_code:
        paymentAnalyticsData?.receiptOrganizationFiscalCode,
      reason
    })
  );

  return (
    <>
      <OperationResultScreenContent
        testID="download-receipt-error-screen"
        {...mapDownloadReceiptErrorToOutcomeProps(
          receiptError,
          () => navigate.goBack(),
          () => present()
        )}
      />
      {bottomSheet}
    </>
  );
};

export default ReceiptDownloadErrorScreen;
