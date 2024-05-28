import { constVoid } from "fp-ts/lib/function";
import * as React from "react";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { View } from "react-native";

import {
  FooterWithButtons,
  IOColors,
  IOStyles
} from "@pagopa/io-app-design-system";
import Pdf from "react-native-pdf";
import { RouteProp } from "@react-navigation/native";
import { PaymentsTransactionBizEventsParamsList } from "../navigation/params";
import { walletTransactionsBizEventsReceiptPotSelector } from "../store/selectors";
import { useIOSelector } from "../../../../store/hooks";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { RECEIPT_DOCUMENT_TYPE_PREFIX } from "../utils";

export type PaymentsTransactionBizEventsPreviewScreenProps = RouteProp<
  PaymentsTransactionBizEventsParamsList,
  "PAYMENT_TRANSACTION_BIZ_EVENTS_PREVIEW_SCREEN"
>;

const PaymentsTransactionBizEventsPreviewScreen = () => {
  const transactionReceiptPot = useIOSelector(
    walletTransactionsBizEventsReceiptPotSelector
  );

  useHeaderSecondLevel({
    title: "",
    canGoBack: true,
    supportRequest: true
  });

  if (pot.isSome(transactionReceiptPot)) {
    return (
      <View style={{ ...IOStyles.flex, backgroundColor: IOColors["grey-100"] }}>
        <Pdf
          style={{ flex: 1 }}
          source={{
            uri: `${RECEIPT_DOCUMENT_TYPE_PREFIX}${transactionReceiptPot.value}`,
            cache: true
          }}
        />
        <FooterWithButtons
          type="SingleButton"
          primary={{
            type: "Solid",
            buttonProps: {
              label: "Salva o condividi",
              onPress: () => constVoid
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
