import { constVoid } from "fp-ts/lib/function";
import * as React from "react";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { Share, View } from "react-native";

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
import { FooterActions } from "../../../../components/ui/FooterActions";

export type PaymentsTransactionBizEventsPreviewScreenProps = RouteProp<
  PaymentsTransactionBizEventsParamsList,
  "PAYMENT_TRANSACTION_BIZ_EVENTS_PREVIEW_SCREEN"
>;

const PREVIEW_OVERRIDED_MARGIN_TOP = -56;

const PaymentsTransactionBizEventsPreviewScreen = () => {
  const transactionReceiptPot = useIOSelector(
    walletTransactionsBizEventsReceiptPotSelector
  );

  useHeaderSecondLevel({
    title: "",
    canGoBack: true,
    supportRequest: true
  });

  const handleOnShare = async () => {
    try {
      const result = await Share.share({
        url: `${RECEIPT_DOCUMENT_TYPE_PREFIX}${transactionReceiptPot.value}`
      });
    } catch (err) {
      console.log(err);
    }
  };

  if (pot.isSome(transactionReceiptPot)) {
    return (
      <View style={{ ...IOStyles.flex }}>
        <Pdf
          enablePaging
          fitPolicy={0}
          style={{
            flexGrow: 1,
            backgroundColor: IOColors["grey-100"],
            marginTop: PREVIEW_OVERRIDED_MARGIN_TOP
          }}
          source={{
            uri: `${RECEIPT_DOCUMENT_TYPE_PREFIX}${transactionReceiptPot.value}`,
            cache: true
          }}
        />
        <FooterActions
          actions={{
            type: "SingleButton",
            primary: {
              label: "Salva o condividi",
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
