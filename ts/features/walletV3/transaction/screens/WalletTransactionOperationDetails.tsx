import * as React from "react";
import { ScrollView } from "react-native";
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

export type WalletTransactionOperationDetailsScreenParams = {
  operationName: string;
  operationDetails: Dettaglio;
};

export type WalletTransactionOperationDetailsScreenProps = RouteProp<
  WalletTransactionParamsList,
  "WALLET_TRANSACTION_OPERATION_DETAILS"
>;

const WalletTransactionOperationDetailsScreen = () => {
  const route = useRoute<WalletTransactionOperationDetailsScreenProps>();
  const { operationDetails, operationName } = route.params;

  const getDebitoreText = () => {
    const debitoreNameLabel = operationDetails.nomePagatore ? (
      <H6>{operationDetails.nomePagatore}</H6>
    ) : (
      <></>
    );
    const debitoreCodiceLabel = operationDetails.codicePagatore ? (
      <H6>({operationDetails.codicePagatore})</H6>
    ) : (
      <></>
    );
    return (
      <>
        {debitoreNameLabel}
        {debitoreCodiceLabel}
      </>
    );
  };

  return (
    <TopScreenComponent goBack>
      <ScrollView style={[IOStyles.flex, IOStyles.horizontalContentPadding]}>
        <H1>{cleanTransactionDescription(operationName)}</H1>
        {operationDetails.importo && (
          <ListItemInfo
            label="Importo"
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
              label="Ente creditore"
              value={operationDetails.enteBeneficiario}
            />
            <Divider />
          </>
        )}
        {(operationDetails.codicePagatore || operationDetails.nomePagatore) && (
          <>
            <ListItemInfo label="Debitore" value={getDebitoreText()} />
            <Divider />
          </>
        )}
        {operationDetails.IUV && (
          <>
            <ListItemInfo label="IUV" value={operationDetails.IUV} />
          </>
        )}
      </ScrollView>
    </TopScreenComponent>
  );
};

export default WalletTransactionOperationDetailsScreen;
