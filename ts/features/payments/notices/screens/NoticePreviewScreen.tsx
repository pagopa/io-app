import * as pot from "@pagopa/ts-commons/lib/pot";
import * as React from "react";
import { Platform, View } from "react-native";
import Share from "react-native-share";
import { IOColors, IOStyles } from "@pagopa/io-app-design-system";
import { RouteProp } from "@react-navigation/native";
import Pdf from "react-native-pdf";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import {
  FooterActions,
  FooterActionsMeasurements
} from "../../../../components/ui/FooterActions";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import * as analytics from "../analytics";
import { PaymentsNoticeParamsList } from "../navigation/params";
import { walletNoticeReceiptPotSelector } from "../store/selectors";
import { RECEIPT_DOCUMENT_TYPE_PREFIX } from "../utils";

export type PaymentsNoticePreviewScreenProps = RouteProp<
  PaymentsNoticeParamsList,
  "PAYMENT_NOTICE_PREVIEW_SCREEN"
>;

const PaymentsNoticePreviewScreen = () => {
  const [footerActionsMeasurements, setfooterActionsMeasurements] =
    React.useState<FooterActionsMeasurements>({
      actionBlockHeight: 0,
      safeBottomAreaHeight: 0
    });

  const transactionReceiptPot = useIOSelector(walletNoticeReceiptPotSelector);

  useHeaderSecondLevel({
    title: "",
    supportRequest: true
  });

  const handleOnShare = async () => {
    const transactionReceiptFileInfo = pot.toUndefined(transactionReceiptPot);
    if (!transactionReceiptFileInfo) {
      return;
    }
    analytics.trackPaymentsSaveAndShareReceipt();
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
    setfooterActionsMeasurements(values);
  };

  if (pot.isSome(transactionReceiptPot)) {
    return (
      <View
        style={{
          ...IOStyles.flex,
          paddingBottom: footerActionsMeasurements.safeBottomAreaHeight
        }}
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
      pictogram="umbrellaNew"
      title={I18n.t("global.genericError")}
    />
  );
};

export default PaymentsNoticePreviewScreen;
