import { Text as NBText, View as NBView } from "native-base";
import React from "react";
import { StyleSheet, View, Image } from "react-native";
import { OperationTypeEnum as IbanOperationType } from "../../../../../../definitions/idpay/timeline/IbanOperationDTO";
import { OperationTypeEnum as InstrumentOperationType } from "../../../../../../definitions/idpay/timeline/InstrumentOperationDTO";
import { OperationTypeEnum as OnboardingOperationType } from "../../../../../../definitions/idpay/timeline/OnboardingOperationDTO";
import { OperationListDTO } from "../../../../../../definitions/idpay/timeline/OperationListDTO";
import { OperationTypeEnum as TransactionOperationType } from "../../../../../../definitions/idpay/timeline/TransactionOperationDTO";
import ButtonDefaultOpacity from "../../../../../components/ButtonDefaultOpacity";
import CopyButtonComponent from "../../../../../components/CopyButtonComponent";
import { Body } from "../../../../../components/core/typography/Body";
import { H4 } from "../../../../../components/core/typography/H4";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import ItemSeparatorComponent from "../../../../../components/ItemSeparatorComponent";
import I18n from "../../../../../i18n";
import themeVariables from "../../../../../theme/variables";
import { formatDateAsLocal } from "../../../../../utils/dates";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";

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

type OperationDetailsProps = {
  operation?: OperationListDTO;
};

const OperationDetails = (props: OperationDetailsProps) => {
  const { operation } = props;

  switch (operation?.operationType) {
    case TransactionOperationType.TRANSACTION:
      return (
        <View style={styles.container}>
          <View style={styles.detailRow}>
            <Body>Metodo di pagamento</Body>
            <View style={styles.centerRow}>
              <Image
                style={styles.brandLogo}
                source={{ uri: operation.brandLogo }}
              />
              <NBView hspacer={true} small={true} />
              <Body weight="SemiBold">{operation.maskedPan}</Body>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Body>Importo transazione</Body>
            <Body weight="SemiBold">{operation.amount}</Body>
          </View>
          <View style={styles.detailRow}>
            <Body>Importo rimborsabile</Body>
            <Body weight="SemiBold">{operation.amount}</Body>
          </View>
          <ItemSeparatorComponent noPadded={true} />
          <NBView spacer={true} large={true} />
          <H4>Informazioni sulla transazione</H4>
          <View style={styles.detailRow}>
            <Body>Data</Body>
            <Body weight="SemiBold">
              {formatDateAsLocal(operation.operationDate)}
            </Body>
          </View>
          <View style={styles.detailRow}>
            <Body>Circuito di pagamento</Body>
            <Body weight="SemiBold">
              {operationCircuitTypeMap[operation.circuitType]}
            </Body>
          </View>
          <View style={styles.detailRow}>
            <Body>ID transazione Acquirer</Body>
            <View style={IOStyles.row}>
              <Body weight="SemiBold">{operation.operationId}</Body>
              <NBView hspacer={true} small={true} />
              <CopyButtonComponent textToCopy={operation.operationId} />
            </View>
          </View>
          <View style={styles.detailRow}>
            <Body>ID transazione Issuer</Body>
            <View style={IOStyles.row}>
              <Body weight="SemiBold">{operation.operationId}</Body>
              <NBView hspacer={true} small={true} />
              <CopyButtonComponent textToCopy={operation.operationId} />
            </View>
          </View>
        </View>
      );
    case IbanOperationType.ADD_IBAN:
    case InstrumentOperationType.ADD_INSTRUMENT:
    case OnboardingOperationType.ONBOARDING:
      return null;
    default:
      return null;
  }
};

export const useOperationDetailsBottomSheet = () => {
  const [operation, setOperation] = React.useState<OperationListDTO>();

  const footer = (
    <View style={styles.footer}>
      <ButtonDefaultOpacity
        block={true}
        bordered={true}
        onPress={() => dismiss()}
      >
        <NBText>{I18n.t("global.buttons.close")}</NBText>
      </ButtonDefaultOpacity>
    </View>
  );

  const modal = useIOBottomSheetModal(
    <OperationDetails operation={operation} />,
    I18n.t("idpay.initiative.operationDetails.title"),
    530,
    footer
  );

  const present = (operation: OperationListDTO) => {
    setOperation(operation);
    modal.present();
  };

  const dismiss = () => {
    modal.dismiss();
    setOperation(undefined);
  };

  return { bottomSheet: modal.bottomSheet, present, dismiss };
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
