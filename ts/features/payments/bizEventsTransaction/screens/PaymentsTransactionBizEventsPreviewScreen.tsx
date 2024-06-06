import * as React from "react";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { View } from "react-native";
import Share from "react-native-share";

import { IOColors, IOStyles } from "@pagopa/io-app-design-system";
import Pdf from "react-native-pdf";
import { RouteProp } from "@react-navigation/native";
import { PaymentsTransactionBizEventsParamsList } from "../navigation/params";
import { walletTransactionsBizEventsReceiptPotSelector } from "../store/selectors";
import { useIOSelector } from "../../../../store/hooks";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { RECEIPT_DOCUMENT_TYPE_PREFIX } from "../utils";
import {
  FooterActions,
  FooterActionsMeasurements
} from "../../../../components/ui/FooterActions";

export type PaymentsTransactionBizEventsPreviewScreenProps = RouteProp<
  PaymentsTransactionBizEventsParamsList,
  "PAYMENT_TRANSACTION_BIZ_EVENTS_PREVIEW_SCREEN"
>;

const PaymentsTransactionBizEventsPreviewScreen = () => {
  const [footerActionsMeasurements, setfooterActionsMeasurements] =
    React.useState<FooterActionsMeasurements>({
      actionBlockHeight: 0,
      safeBottomAreaHeight: 0
    });

  const transactionReceiptPot = useIOSelector(
    walletTransactionsBizEventsReceiptPotSelector
  );

  useHeaderSecondLevel({
    title: "",
    canGoBack: true,
    supportRequest: true
  });

  const handleOnShare = async () => {
    const transactionReceiptFile = pot.toUndefined(transactionReceiptPot);
    if (!transactionReceiptFile) {
      return;
    }
    try {
      await Share.open({
        activityItemSources: [
          {
            item: {
              default: {
                content: `${I18n.t(
                  "features.payments.transactions.receipt.title"
                )}.pdf`,
                type: "url"
              }
            },
            placeholderItem: {
              content: `${I18n.t(
                "features.payments.transactions.receipt.title"
              )}.pdf`,
              type: "url"
            }
          }
        ],
        type: "application/pdf",
        url: `${RECEIPT_DOCUMENT_TYPE_PREFIX}${transactionReceiptFile}`
      });
    } catch (err) {
      // Don't do anything if the user cancels the share action
    }
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
            uri: `${RECEIPT_DOCUMENT_TYPE_PREFIX}${transactionReceiptPot.value}`,
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

export default PaymentsTransactionBizEventsPreviewScreen;
