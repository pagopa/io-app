import * as pot from "@pagopa/ts-commons/lib/pot";
import { Text as NBText } from "native-base";
import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { OperationListDTO } from "../../../../../../definitions/idpay/timeline/OperationListDTO";
import { TransactionDetailDTO } from "../../../../../../definitions/idpay/timeline/TransactionDetailDTO";
import { InitiativeDTO } from "../../../../../../definitions/idpay/wallet/InitiativeDTO";
import ButtonDefaultOpacity from "../../../../../components/ButtonDefaultOpacity";
import CopyButtonComponent from "../../../../../components/CopyButtonComponent";
import { Pictogram } from "../../../../../components/core/pictograms";
import { HSpacer, VSpacer } from "../../../../../components/core/spacer/Spacer";
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

// TODO: this is temporary, mapping should be done on the backend
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

const TransactionDetailsErrorComponent = () => (
  <View>
    <Pictogram name="error" />
  </View>
);

type TransactionDetailsProps = {
  details: TransactionDetailDTO;
};

/**
 *  This component is used to render the details of a transaction type operation
 * @param {TransactionDetailsProps} props
 * @returns {React.ReactElement}
 */
const TransactionDetailsComponent = (props: TransactionDetailsProps) => {
  const { details } = props;

  return (
    <View style={styles.container}>
      <View style={styles.detailRow}>
        <Body>Metodo di pagamento</Body>
        <View style={styles.centerRow}>
          <Image style={styles.brandLogo} source={{ uri: details.brandLogo }} />
          <VSpacer size={8} />
          <Body weight="SemiBold">{details.maskedPan}</Body>
        </View>
      </View>
      <View style={styles.detailRow}>
        <Body>Importo transazione</Body>
        <Body weight="SemiBold">{details.amount}</Body>
      </View>
      <View style={styles.detailRow}>
        <Body>Importo rimborsabile</Body>
        <Body weight="SemiBold">{details.accrued}</Body>
      </View>
      <ItemSeparatorComponent noPadded={true} />
      <VSpacer size={24} />
      <H4>Informazioni sulla transazione</H4>
      <View style={styles.detailRow}>
        <Body>Data</Body>
        <Body weight="SemiBold">
          {formatDateAsLocal(details.operationDate)}
        </Body>
      </View>
      <View style={styles.detailRow}>
        <Body>Circuito di pagamento</Body>
        <Body weight="SemiBold">
          {operationCircuitTypeMap[details.circuitType]}
        </Body>
      </View>
      <View style={styles.detailRow}>
        <Body>ID transazione Acquirer</Body>
        <View style={IOStyles.row}>
          <Body weight="SemiBold">{details.operationId}</Body>
          <VSpacer size={8} />
          <CopyButtonComponent textToCopy={details.idTrxAcquirer} />
        </View>
      </View>
      <View style={styles.detailRow}>
        <Body>ID transazione Issuer</Body>
        <View style={IOStyles.row}>
          <Body weight="SemiBold">{details.idTrxIssuer}</Body>
          <HSpacer size={8} />
          <CopyButtonComponent textToCopy={details.operationId} />
        </View>
      </View>
    </View>
  );
};

/**
 * Component displayed in the bottom sheet to show the details of a timeline operation
 * @returns {React.ReactElement}
 */
const TimelineDetailsBottomSheet = () => {
  const detailsPot = useIOSelector(idpayTimelineDetailsSelector);
  const isLoading = pot.isLoading(detailsPot);

  const renderContent = () => {
    if (pot.isError(detailsPot)) {
      return <TransactionDetailsErrorComponent />;
    } else if (pot.isSome(detailsPot)) {
      return <TransactionDetailsComponent details={detailsPot.value} />;
    }
    return null;
  };

  return (
    <LoadingSpinnerOverlay isLoading={isLoading} loadingOpacity={100}>
      {renderContent()}
    </LoadingSpinnerOverlay>
  );
};

/**
 * This hook is used to show the bottom sheet with the details of a timeline operation
 * @param {InitiativeDTO["initiativeId"]} initiativeId
 */
export const useTimelineDetailsBottomSheet = (
  initiativeId: InitiativeDTO["initiativeId"]
) => {
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
    <TimelineDetailsBottomSheet />,
    I18n.t("idpay.initiative.operationDetails.title"),
    530,
    bottomSheetFooter
  );

  const present = (operationId: OperationListDTO["operationId"]) => {
    dispatch(idpayTimelineDetailsGet.request({ initiativeId, operationId }));
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
