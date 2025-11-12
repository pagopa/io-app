import {
  FooterActions,
  FooterActionsMeasurements,
  IOColors,
  useIOTheme
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useState } from "react";
import { Platform, View } from "react-native";
import Pdf from "react-native-pdf";
import Share from "react-native-share";
import I18n from "i18next";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useIOSelector } from "../../../../store/hooks";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { paymentAnalyticsDataSelector } from "../../history/store/selectors";
import * as analytics from "../analytics";
import { walletReceiptPotSelector } from "../store/selectors";
import { RECEIPT_DOCUMENT_TYPE_PREFIX } from "../utils";

const ReceiptPreviewScreen = () => {
  const theme = useIOTheme();
  const backgroundColor = IOColors[theme["appBackground-secondary"]];
  const [footerActionsMeasurements, setFooterActionsMeasurements] =
    useState<FooterActionsMeasurements>({
      actionBlockHeight: 0,
      safeBottomAreaHeight: 0
    });

  const transactionReceiptPot = useIOSelector(walletReceiptPotSelector);
  const paymentAnalyticsData = useIOSelector(paymentAnalyticsDataSelector);

  useOnFirstRender(() => {
    analytics.trackPaymentsDownloadReceiptSuccess({
      organization_name: paymentAnalyticsData?.receiptOrganizationName,
      organization_fiscal_code:
        paymentAnalyticsData?.receiptOrganizationFiscalCode,
      first_time_opening: paymentAnalyticsData?.receiptFirstTimeOpeningPDF,
      user: paymentAnalyticsData?.receiptUser
    });
  });

  useHeaderSecondLevel({
    title: "",
    supportRequest: true
  });

  const handleOnShare = async () => {
    const transactionReceiptFileInfo = pot.toUndefined(transactionReceiptPot);
    if (!transactionReceiptFileInfo) {
      return;
    }
    analytics.trackPaymentsSaveAndShareReceipt({
      organization_name: paymentAnalyticsData?.receiptOrganizationName,
      first_time_opening: paymentAnalyticsData?.receiptFirstTimeOpening,
      user: paymentAnalyticsData?.receiptUser,
      organization_fiscal_code:
        paymentAnalyticsData?.receiptOrganizationFiscalCode
    });
    // The file name is normalized to remove the .pdf extension on Android devices since it's added by default to the Share module
    const normalizedFilename =
      Platform.OS === "ios"
        ? transactionReceiptFileInfo.filename
        : transactionReceiptFileInfo.filename?.replace(/.pdf/g, "");
    await Share.open({
      type: "application/pdf",
      url: `${RECEIPT_DOCUMENT_TYPE_PREFIX}${transactionReceiptFileInfo.base64File}`,
      filename:
        normalizedFilename ||
        `${I18n.t("features.payments.transactions.receipt.title")}${
          Platform.OS === "ios" ? ".pdf" : ""
        }`,
      failOnCancel: false
    });
  };

  const handleFooterActionsMeasurements = (
    values: FooterActionsMeasurements
  ) => {
    setFooterActionsMeasurements(values);
  };

  if (pot.isSome(transactionReceiptPot)) {
    return (
      <View
        style={{
          flex: 1,
          paddingBottom: footerActionsMeasurements.safeBottomAreaHeight
        }}
      >
        <View
          style={{ flex: 1 }}
          accessibilityLabel={I18n.t(
            "features.payments.transactions.receipt.a11y.preview"
          )}
        >
          {/** Be aware that, in react-native-pdf 6.7.7, on Android, there
           * is a bug where onLoadComplete callback is not called. So,
           * if you have to use such callback, you should rely upon
           * onPageChanged, which is called to report that the first page
           * has loaded */}
          <Pdf
            enablePaging
            fitPolicy={0}
            style={{
              flexGrow: 1,
              backgroundColor
            }}
            source={{
              uri: `${RECEIPT_DOCUMENT_TYPE_PREFIX}${transactionReceiptPot.value.base64File}`,
              cache: true
            }}
          />
        </View>
        <FooterActions
          onMeasure={handleFooterActionsMeasurements}
          actions={{
            type: "SingleButton",
            primary: {
              label: I18n.t(
                "features.payments.transactions.receipt.shareButton"
              ),
              onPress: handleOnShare
            }
          }}
        />
      </View>
    );
  }
  return (
    <OperationResultScreenContent
      pictogram="umbrella"
      title={I18n.t("global.genericError")}
      enableAnimatedPictogram
      loop
    />
  );
};

export default ReceiptPreviewScreen;
