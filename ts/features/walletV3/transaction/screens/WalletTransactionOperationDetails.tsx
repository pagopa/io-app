import * as React from "react";
import { ScrollView, StyleSheet } from "react-native";
import {
  Divider,
  H1,
  H6,
  IOStyles,
  ListItemInfo
} from "@pagopa/io-app-design-system";
import { RouteProp, useRoute } from "@react-navigation/native";

import { WalletTransactionParamsList } from "../navigation/navigator";
import TopScreenComponent from "../../../../components/screens/TopScreenComponent";
import { Dettaglio } from "../../../../../definitions/pagopa/Dettaglio";
import { formatNumberCentsToAmount } from "../../../../utils/stringBuilder";
import { cleanTransactionDescription } from "../../../../utils/payment";
import I18n from "../../../../i18n";
import { RNavScreenWithLargeHeader } from "../../../../components/ui/RNavScreenWithLargeHeader";

const styles = StyleSheet.create({
  scrollViewContainer: {
    ...IOStyles.flex,
    ...IOStyles.horizontalContentPadding
  }
});

export type WalletTransactionOperationDetailsScreenParams = {
  operationName: string;
  operationSubject: string;
  operationDetails: Dettaglio;
};

export type WalletTransactionOperationDetailsScreenProps = RouteProp<
  WalletTransactionParamsList,
  "WALLET_TRANSACTION_OPERATION_DETAILS"
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
    <RNavScreenWithLargeHeader
      title={cleanTransactionDescription(operationName)}
    >
      <ScrollView style={styles.scrollViewContainer}>
        {operationDetails.importo && (
          <ListItemInfo
            accessibilityLabel={I18n.t("transaction.details.operation.amount")}
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
              accessibilityLabel={I18n.t(
                "transaction.details.operation.creditor"
              )}
              value={operationDetails.enteBeneficiario}
            />
            <Divider />
          </>
        )}
        {(operationDetails.codicePagatore || operationDetails.nomePagatore) && (
          <>
            <ListItemInfo
              label={I18n.t("transaction.details.operation.debtor")}
              accessibilityLabel={I18n.t(
                "transaction.details.operation.debtor"
              )}
              value={getDebtorText()}
            />
            <Divider />
          </>
        )}
        {operationDetails.IUV && (
          <>
            <ListItemInfo
              label={I18n.t("transaction.details.operation.iuv")}
              accessibilityLabel={I18n.t("transaction.details.operation.iuv")}
              value={operationDetails.IUV}
            />
            <Divider />
          </>
        )}
        {operationSubject && (
          <ListItemInfo
            numberOfLines={4}
            label={I18n.t("transaction.details.operation.subject")}
            accessibilityLabel={I18n.t("transaction.details.operation.subject")}
            value={operationSubject}
          />
        )}
      </ScrollView>
    </RNavScreenWithLargeHeader>
  );
};

export default WalletTransactionOperationDetailsScreen;
