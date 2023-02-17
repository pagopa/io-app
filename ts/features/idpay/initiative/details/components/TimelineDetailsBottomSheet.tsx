import * as pot from "@pagopa/ts-commons/lib/pot";
import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { OperationDTO } from "../../../../../../definitions/idpay/OperationDTO";
import { OperationListDTO } from "../../../../../../definitions/idpay/OperationListDTO";
import {
  OperationTypeEnum as TransactionDetailOperationTypeEnum,
  TransactionDetailDTO
} from "../../../../../../definitions/idpay/TransactionDetailDTO";
import { InitiativeDTO } from "../../../../../../definitions/idpay/InitiativeDTO";
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
import { format } from "../../../../../utils/dates";
import {
  IOBottomSheetModal,
  useIOBottomSheetModal
} from "../../../../../utils/hooks/bottomSheet";
import { formatNumberAmount } from "../../../../../utils/stringBuilder";
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

type InstrumentDetailsComponentProps = Pick<
  TransactionDetailDTO,
  "brandLogo" | "maskedPan"
>;

/**
 * Displays the info of the instrument used for the transaction, with the logo of the brand and the masked pan
 * @param {InstrumentDetailsComponentProps} props
 * @returns
 */
const InstrumentDetailsComponent = (props: InstrumentDetailsComponentProps) => (
  <View style={styles.centerRow}>
    <Image style={styles.brandLogo} source={{ uri: props.brandLogo }} />
    <HSpacer size={8} />
    <Body weight="SemiBold">
      {I18n.t("idpay.initiative.operationDetails.maskedPan", {
        lastDigits: props.maskedPan
      })}
    </Body>
  </View>
);

/**
 * Displays a generic error message
 * @returns {React.ReactElement}
 */
const TimelineDetailsErrorComponent = () => (
  <View>
    <Pictogram name="error" />
  </View>
);

type CopyTextProps = {
  text: string;
};

/**
 * Utility component to display a text with a CopyButtonComponent
 * @param props
 */
const CopyTextComponent = (props: CopyTextProps) => (
  <View style={[IOStyles.flex, IOStyles.row]}>
    <Body
      weight="SemiBold"
      numberOfLines={1}
      ellipsizeMode="tail"
      style={IOStyles.flex}
    >
      {props.text}
    </Body>
    <HSpacer size={8} />
    <CopyButtonComponent textToCopy={props.text} />
  </View>
);

type TransactionDetailsProps = {
  details: OperationDTO;
};

/**
 *  This component is used to render the details of an operation
 * @param {TransactionDetailsProps} props
 * @returns {React.ReactElement}
 */
const TimelineDetailsComponent = (props: TransactionDetailsProps) => {
  const { details } = props;

  switch (details.operationType) {
    case TransactionDetailOperationTypeEnum.TRANSACTION:
      return (
        <View style={styles.container}>
          <View style={styles.detailRow}>
            <Body>
              {I18n.t("idpay.initiative.operationDetails.instrument")}
            </Body>
            <InstrumentDetailsComponent {...details} />
          </View>
          <View style={styles.detailRow}>
            <Body>
              {I18n.t("idpay.initiative.operationDetails.amountLabel")}
            </Body>
            <Body weight="SemiBold">
              {formatNumberAmount(details.amount, true)}
            </Body>
          </View>
          <View style={styles.detailRow}>
            <Body>
              {I18n.t("idpay.initiative.operationDetails.accruedAmountLabel")}
            </Body>
            <Body weight="SemiBold">
              {formatNumberAmount(details.accrued, true)}
            </Body>
          </View>
          <ItemSeparatorComponent noPadded={true} />
          <VSpacer size={24} />
          <H4>{I18n.t("idpay.initiative.operationDetails.infoTitle")}</H4>
          <View style={styles.detailRow}>
            <Body>{I18n.t("idpay.initiative.operationDetails.date")}</Body>
            <Body weight="SemiBold">
              {format(details.operationDate, "DD MMM YYYY, HH:mm")}
            </Body>
          </View>
          <View style={styles.detailRow}>
            <Body>{I18n.t("idpay.initiative.operationDetails.circuit")}</Body>
            <Body weight="SemiBold">
              {operationCircuitTypeMap[details.circuitType]}
            </Body>
          </View>
          <View style={styles.detailRow}>
            <Body>
              {I18n.t("idpay.initiative.operationDetails.acquirerId")}
            </Body>
            <HSpacer size={16} />
            <CopyTextComponent text={details.idTrxAcquirer} />
          </View>
          <View style={styles.detailRow}>
            <Body style={{ flex: 1 }}>
              {I18n.t("idpay.initiative.operationDetails.issuerId")}
            </Body>
            <HSpacer size={16} />
            <CopyTextComponent text={details.idTrxIssuer} />
          </View>
        </View>
      );
    default:
      // We don't show additional info for other operation types
      return null;
  }
};

/**
 * Component displayed in the bottom sheet to show the details of a timeline operation.
 * The content of this component is retrieved from the store via selector.
 * @returns {React.ReactElement}
 */
const TimelineDetailsBottomSheet = () => {
  const detailsPot = useIOSelector(idpayTimelineDetailsSelector);
  const isLoading = pot.isLoading(detailsPot);

  const renderContent = () => {
    if (pot.isError(detailsPot)) {
      return <TimelineDetailsErrorComponent />;
    } else if (pot.isSome(detailsPot)) {
      return <TimelineDetailsComponent details={detailsPot.value} />;
    }
    return null;
  };

  return (
    <LoadingSpinnerOverlay isLoading={isLoading} loadingOpacity={100}>
      {renderContent()}
    </LoadingSpinnerOverlay>
  );
};

export type TimelineDetailsBottomSheetModal = Omit<
  IOBottomSheetModal,
  "present"
> & {
  present: (operationId: OperationListDTO["operationId"]) => void;
};

/**
 * This hook is used to show the bottom sheet with the details of a timeline operation
 * @param {InitiativeDTO["initiativeId"]} initiativeId
 * @returns {TimelineDetailsBottomSheetModal}
 */
export const useTimelineDetailsBottomSheet = (
  initiativeId: InitiativeDTO["initiativeId"]
): TimelineDetailsBottomSheetModal => {
  const dispatch = useIODispatch();

  const bottomSheetFooter = (
    <View style={styles.footer}>
      <ButtonDefaultOpacity
        block={true}
        bordered={true}
        onPress={() => modal.dismiss()}
      >
        <H4 color="blue">{I18n.t("global.buttons.close")}</H4>
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
