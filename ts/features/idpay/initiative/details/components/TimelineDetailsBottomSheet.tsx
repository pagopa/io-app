import * as pot from "@pagopa/ts-commons/lib/pot";
import { Text as NBText, View as NBView } from "native-base";
import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { OperationListDTO } from "../../../../../../definitions/idpay/timeline/OperationListDTO";
import { TransactionDetailDTO } from "../../../../../../definitions/idpay/timeline/TransactionDetailDTO";
import ButtonDefaultOpacity from "../../../../../components/ButtonDefaultOpacity";
import CopyButtonComponent from "../../../../../components/CopyButtonComponent";
import { Body } from "../../../../../components/core/typography/Body";
import { H4 } from "../../../../../components/core/typography/H4";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import ItemSeparatorComponent from "../../../../../components/ItemSeparatorComponent";
import LoadingSpinnerOverlay from "../../../../../components/LoadingSpinnerOverlay";
import I18n from "../../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import themeVariables from "../../../../../theme/variables";
import { formatDateAsLocal } from "../../../../../utils/dates";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";
import { idpayTimelineDetailsSelector } from "../store";
import { idpayTimelineDetailsGet } from "../store/actions";

// TODO: this mapping should be done on the backend
const operationCircuitTypeMap: Record<string, string> = {
  "00": "Bancomat",
  "01": "Visa",
  "02": "Mastercard",
  "03": "Amex",
  "04": "JCB",
  "05": "UnionPay",
  "06": "Diners",
  "07": "PostePay",
  "08": "BancomatPay",
  "09": "Satispay",
  "10": "PrivateCircuit"
};

const renderTimelineDetails = (transaction: TransactionDetailDTO) => (
  <View style={styles.container}>
    <View style={styles.detailRow}>
      <Body>Metodo di pagamento</Body>
      <View style={styles.centerRow}>
        <Image
          style={styles.brandLogo}
          source={{ uri: transaction.brandLogo }}
        />
        <NBView hspacer={true} small={true} />
        <Body weight="SemiBold">{transaction.maskedPan}</Body>
      </View>
    </View>
    <View style={styles.detailRow}>
      <Body>Importo transazione</Body>
      <Body weight="SemiBold">{transaction.amount}</Body>
    </View>
    <View style={styles.detailRow}>
      <Body>Importo rimborsabile</Body>
      <Body weight="SemiBold">{transaction.accrued}</Body>
    </View>
    <ItemSeparatorComponent noPadded={true} />
    <NBView spacer={true} large={true} />
    <H4>Informazioni sulla transazione</H4>
    <View style={styles.detailRow}>
      <Body>Data</Body>
      <Body weight="SemiBold">
        {formatDateAsLocal(transaction.operationDate)}
      </Body>
    </View>
    <View style={styles.detailRow}>
      <Body>Circuito di pagamento</Body>
      <Body weight="SemiBold">
        {operationCircuitTypeMap[transaction.circuitType]}
      </Body>
    </View>
    <View style={styles.detailRow}>
      <Body>ID transazione Acquirer</Body>
      <View style={IOStyles.row}>
        <Body weight="SemiBold">{transaction.operationId}</Body>
        <NBView hspacer={true} small={true} />
        <CopyButtonComponent textToCopy={transaction.idTrxAcquirer} />
      </View>
    </View>
    <View style={styles.detailRow}>
      <Body>ID transazione Issuer</Body>
      <View style={IOStyles.row}>
        <Body weight="SemiBold">{transaction.idTrxIssuer}</Body>
        <NBView hspacer={true} small={true} />
        <CopyButtonComponent textToCopy={transaction.operationId} />
      </View>
    </View>
  </View>
);

const TimelineDetailsComponent = () => {
  const detailsPot = useIOSelector(idpayTimelineDetailsSelector);

  const isLoading = pot.isLoading(detailsPot);

  return (
    <LoadingSpinnerOverlay isLoading={isLoading} loadingOpacity={100}>
      {pot.isSome(detailsPot) && renderTimelineDetails(detailsPot.value)}
    </LoadingSpinnerOverlay>
  );
};

export const useTimelineDetailsBottomSheet = () => {
  const dispatch = useIODispatch();

  const bottomSheetFooter = (
    <View style={styles.footer}>
      <ButtonDefaultOpacity
        block={true}
        bordered={true}
        onPress={() => modal.dismiss()}
      >
        <NBText>{I18n.t("global.buttons.close")}</NBText>
      </ButtonDefaultOpacity>
    </View>
  );

  const modal = useIOBottomSheetModal(
    <TimelineDetailsComponent />,
    I18n.t("idpay.initiative.operationDetails.title"),
    530,
    bottomSheetFooter
  );

  const present = (operationId: OperationListDTO["operationId"]) => {
    dispatch(idpayTimelineDetailsGet.request(operationId));
    modal.present();
  };

  return { ...modal, present };
};

const styles = StyleSheet.create({
  footer: {
    padding: themeVariables.contentPadding
  },
  container: {
    flex: 1,
    flexGrow: 1,
    paddingVertical: themeVariables.spacerHeight
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: themeVariables.spacerSmallHeight,
    paddingBottom: themeVariables.spacerSmallHeight
  },
  centerRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  brandLogo: {
    width: 24,
    height: 16
  }
});
