import * as pot from "@pagopa/ts-commons/lib/pot";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import useReceiptFailureSupportModal from "../hooks/useReceiptFailureSupportModal";
import { walletReceiptPotSelector } from "../store/selectors";
import { mapDownloadReceiptErrorToOutcomeProps } from "../utils";

const ReceiptDownloadErrorScreen = () => {
  const transactionReceiptPot = useIOSelector(walletReceiptPotSelector);
  const navigate = useIONavigation();

  const receiptError = pot.isError(transactionReceiptPot)
    ? transactionReceiptPot.error
    : undefined;

  const { bottomSheet, present } = useReceiptFailureSupportModal(receiptError);

  // TODO add mixpanel tracking IOBP-2558
  // useOnFirstRender(() =>
  //   analytics.trackPaymentsDownloadReceiptError({
  //     organization_name: paymentAnalyticsData?.receiptOrganizationName,
  //     first_time_opening: paymentAnalyticsData?.receiptFirstTimeOpening,
  //     user: paymentAnalyticsData?.receiptUser,
  //     organization_fiscal_code:
  //       paymentAnalyticsData?.receiptOrganizationFiscalCode
  //     PARAM TO ADD HERE
  //   })
  // );

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
