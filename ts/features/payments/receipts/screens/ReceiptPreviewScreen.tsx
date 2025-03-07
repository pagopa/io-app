import {
  FooterActions,
  FooterActionsMeasurements,
  IOColors,
  IOStyles
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { RouteProp } from "@react-navigation/native";
import { useState } from "react";
import { Platform, View } from "react-native";
import Pdf from "react-native-pdf";
import Share from "react-native-share";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { paymentAnalyticsDataSelector } from "../../history/store/selectors";
import * as analytics from "../analytics";
import { PaymentsReceiptParamsList } from "../navigation/params";
import { walletReceiptPotSelector } from "../store/selectors";
import { RECEIPT_DOCUMENT_TYPE_PREFIX } from "../utils";

export type ReceiptPreviewScreenProps = RouteProp<
  PaymentsReceiptParamsList,
  "PAYMENT_RECEIPT_PREVIEW_SCREEN"
>;

const ReceiptPreviewScreen = () => {
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
        paymentAnalyticsData?.verifiedData?.paFiscalCode,
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
      payment_status: "paid",
      organization_name: paymentAnalyticsData?.receiptOrganizationName,
      first_time_opening: paymentAnalyticsData?.receiptFirstTimeOpening,
      user: paymentAnalyticsData?.receiptUser
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
          ...IOStyles.flex,
          paddingBottom: footerActionsMeasurements.safeBottomAreaHeight
        }}
      >
        <View
          style={{ ...IOStyles.flex }}
          accessibilityLabel={I18n.t(
            "features.payments.transactions.receipt.a11y.preview"
          )}
        >
          <Pdf
            enablePaging
            fitPolicy={0}
            style={{
              flexGrow: 1,
              backgroundColor: IOColors["grey-100"]
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
    />
  );
};

export default ReceiptPreviewScreen;
