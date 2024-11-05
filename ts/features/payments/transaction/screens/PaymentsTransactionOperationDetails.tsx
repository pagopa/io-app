import * as React from "react";
import { ScrollView, StyleSheet } from "react-native";
import {
  Divider,
  H6,
  IOStyles,
  ListItemInfo,
  ListItemInfoCopy
} from "@pagopa/io-app-design-system";
import { RouteProp, useRoute } from "@react-navigation/native";
import { PaymentsTransactionParamsList } from "../navigation/params";
import { Dettaglio } from "../../../../../definitions/pagopa/Dettaglio";
import { formatNumberCentsToAmount } from "../../../../utils/stringBuilder";
import { cleanTransactionDescription } from "../../../../utils/payment";
import I18n from "../../../../i18n";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";

const styles = StyleSheet.create({
  scrollViewContainer: {
    ...IOStyles.flex,
    ...IOStyles.horizontalContentPadding
  }
});

export type PaymentsTransactionOperationDetailsScreenParams = {
  operationName: string;
  operationSubject: string;
  operationDetails: Dettaglio;
};

export type WalletTransactionOperationDetailsScreenProps = RouteProp<
  PaymentsTransactionParamsList,
  "PAYMENT_TRANSACTION_OPERATION_DETAILS"
>;

const WalletTransactionOperationDetailsScreen = () => {
  const route = useRoute<WalletTransactionOperationDetailsScreenProps>();
  const { operationDetails, operationName, operationSubject } = route.params;

  const getDebtorText = () => {
    const debtorNameLabel = operationDetails.nomePagatore ? (
      <H6>{operationDetails.nomePagatore}</H6>
    ) : (
      <></>
    );
    const debtorCodeLabel = operationDetails.codicePagatore ? (
      <H6>({operationDetails.codicePagatore})</H6>
    ) : (
      <></>
    );
    return (
      <>
        {debtorNameLabel}
        {debtorCodeLabel}
      </>
    );
  };

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: cleanTransactionDescription(operationName)
      }}
    >
      <ScrollView style={styles.scrollViewContainer}>
        {operationDetails.importo && (
          <ListItemInfo
            label={I18n.t("transaction.details.operation.amount")}
            value={formatNumberCentsToAmount(
              operationDetails.importo,
              true,
              "right"
            )}
          />
        )}
        <Divider />
        {operationDetails.enteBeneficiario && (
          <>
            <ListItemInfo
              label={I18n.t("transaction.details.operation.creditor")}
              value={operationDetails.enteBeneficiario}
            />
            <Divider />
          </>
        )}
        {(operationDetails.codicePagatore || operationDetails.nomePagatore) && (
          <>
            <ListItemInfo
              label={I18n.t("transaction.details.operation.debtor")}
              value={getDebtorText()}
            />
            <Divider />
          </>
        )}
        {operationDetails.IUV && (
          <>
            <ListItemInfoCopy
              label={I18n.t("transaction.details.operation.iuv")}
              value={operationDetails.IUV}
              onPress={() =>
                clipboardSetStringWithFeedback(operationDetails.IUV ?? "")
              }
              accessibilityLabel={I18n.t("transaction.details.operation.iuv")}
            />
            <Divider />
          </>
        )}
        {operationSubject && (
          <ListItemInfoCopy
            numberOfLines={4}
            label={I18n.t("transaction.details.operation.subject")}
            value={operationSubject}
            onPress={() => clipboardSetStringWithFeedback(operationSubject)}
            accessibilityLabel={I18n.t("transaction.details.operation.subject")}
          />
        )}
      </ScrollView>
    </IOScrollViewWithLargeHeader>
  );
};

export default WalletTransactionOperationDetailsScreen;
