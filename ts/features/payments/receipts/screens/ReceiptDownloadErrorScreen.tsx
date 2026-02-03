import * as pot from "@pagopa/ts-commons/lib/pot";
import { VoidType } from "io-ts";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { walletReceiptPotSelector } from "../store/selectors";
import { mapDownloadReceiptErrorToOutcomeProps } from "../utils";
// import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";

const ReceiptDownloadErrorScreen = () => {
  const transactionReceiptPot = useIOSelector(walletReceiptPotSelector);
  const navigate = useIONavigation();
  // TODO add mixpanel tracking
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
    <OperationResultScreenContent
      {...mapDownloadReceiptErrorToOutcomeProps(
        pot.isError(transactionReceiptPot) && transactionReceiptPot.error,
        () => navigate.goBack(),
        () => VoidType
      )}
    />
  );
};

export default ReceiptDownloadErrorScreen;
