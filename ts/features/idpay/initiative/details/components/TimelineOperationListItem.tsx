import { format } from "date-fns";
import { ListItem } from "native-base";
import React from "react";
import { StyleSheet, View } from "react-native";
import Placeholder from "rn-placeholder";
import { OperationTypeEnum as IbanOperationTypeEnum } from "../../../../../../definitions/idpay/IbanOperationDTO";
import { OperationTypeEnum as OnboardingOperationTypeEnum } from "../../../../../../definitions/idpay/OnboardingOperationDTO";
import { OperationListDTO } from "../../../../../../definitions/idpay/OperationListDTO";
import { OperationTypeEnum as RefundOperationTypeEnum } from "../../../../../../definitions/idpay/RefundOperationDTO";
import { OperationTypeEnum } from "../../../../../../definitions/idpay/RejectedInstrumentOperationDTO";
import { OperationTypeEnum as TransactionOperationTypeEnum } from "../../../../../../definitions/idpay/TransactionOperationDTO";
import { Icon } from "../../../../../components/core/icons";
import { LogoPayment } from "../../../../../components/core/logos";
import { HSpacer, VSpacer } from "../../../../../components/core/spacer/Spacer";
import { H4 } from "../../../../../components/core/typography/H4";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import I18n from "../../../../../i18n";
import { formatDateAsShortFormat } from "../../../../../utils/dates";
import { formatNumberAmount } from "../../../../../utils/stringBuilder";
import { InstrumentBrandEnum, instrumentBrandMap } from "../utils/utils";

const getHourAndMinuteFromDate = (date: Date) => format(date, "HH:mm");

type TimelineOperationListItemProps = {
  operation: OperationListDTO;
  onPress?: () => void;
};

type OperationComponentProps = { operation: OperationListDTO };

const OperationIcon = ({ operation }: OperationComponentProps) => {
  switch (operation.operationType) {
    case OnboardingOperationTypeEnum.ONBOARDING:
      return <Icon name={"ok"} />;

    case IbanOperationTypeEnum.ADD_IBAN:
      return <Icon name={"institution"} color="bluegreyLight" />;

    case RefundOperationTypeEnum.PAID_REFUND:
      return <Icon name="refund" color="bluegrey" />;

    case OperationTypeEnum.REJECTED_ADD_INSTRUMENT:
    case OperationTypeEnum.REJECTED_DELETE_INSTRUMENT:
    case RefundOperationTypeEnum.REJECTED_REFUND:
      return <Icon name={"legWarning"} color="red" />;

    default:
      if ("brand" in operation) {
        const cardIcon =
          instrumentBrandMap[operation.brand as InstrumentBrandEnum];
        return cardIcon !== undefined ? (
          <LogoPayment name={cardIcon} />
        ) : (
          <Icon name="creditCard" size={24} />
        );
      }
      return null;
  }
};

const OperationAmount = ({ operation }: OperationComponentProps) => {
  switch (operation.operationType) {
    case TransactionOperationTypeEnum.TRANSACTION:
      return (
        <H4>{`-${formatNumberAmount(
          Math.abs(operation.accrued),
          false
        )} €`}</H4>
      );
    case TransactionOperationTypeEnum.REVERSAL:
      return (
        <H4>{`+${formatNumberAmount(
          Math.abs(operation.accrued),
          false
        )} €`}</H4>
      );
    case RefundOperationTypeEnum.PAID_REFUND:
      return (
        <H4 color="greenLight">
          {`${formatNumberAmount(operation.amount, false)} €`}
        </H4>
      );
    default:
      return null;
  }
};

const generateTimelineOperationListItemText = (operation: OperationListDTO) => {
  const operationTitle =
    "maskedPan" in operation
      ? I18n.t(
          `idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.operationDescriptions.${operation.operationType}`,
          { maskedPan: operation.maskedPan }
        )
      : I18n.t(
          `idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.operationDescriptions.${operation.operationType}`
        );

  const generateOperationInvoiceText = () => {
    switch (operation.operationType) {
      case TransactionOperationTypeEnum.TRANSACTION:
        return "· " + formatNumberAmount(operation.amount, true);
      case TransactionOperationTypeEnum.REVERSAL:
        return `· € -${operation.amount}`;
      default:
        return "";
    }
  };
  return {
    operationTitle,
    bonusInvoiceText: generateOperationInvoiceText()
  };
};

const TimelineOperationListItem = (props: TimelineOperationListItemProps) => {
  const { operation, onPress } = props;

  const { operationTitle, bonusInvoiceText } =
    generateTimelineOperationListItemText(operation);

  return (
    <ListItem
      style={[
        IOStyles.flex,
        IOStyles.row,
        styles.alignCenter,
        styles.sidePadding,
        styles.spaceBetween
      ]}
      onPress={onPress}
    >
      <OperationIcon operation={operation} />
      <HSpacer size={16} />
      <View style={IOStyles.flex}>
        <H4>{operationTitle}</H4>
        <LabelSmall weight="Regular" color="bluegrey">
          {`${formatDateAsShortFormat(
            operation.operationDate
          )}, ${getHourAndMinuteFromDate(
            operation.operationDate
          )} ${bonusInvoiceText}`}
        </LabelSmall>
      </View>
      <OperationAmount operation={operation} />
    </ListItem>
  );
};

const TimelineOperationListItemSkeleton = () => (
  <ListItem
    style={[
      IOStyles.flex,
      IOStyles.row,
      styles.alignCenter,
      styles.sidePadding,
      styles.spaceBetween
    ]}
  >
    <Placeholder.Box animate="fade" width={24} height={16} radius={4} />
    <HSpacer size={16} />
    <View style={IOStyles.flex}>
      <Placeholder.Box animate="fade" width={132} height={18} radius={4} />
      <VSpacer size={8} />
      <Placeholder.Box animate="fade" width={132} height={16} radius={4} />
    </View>
    <Placeholder.Box animate="fade" width={64} height={16} radius={4} />
  </ListItem>
);

const styles = StyleSheet.create({
  alignCenter: {
    alignItems: "center"
  },
  spaceBetween: {
    justifyContent: "space-between"
  },
  sidePadding: {
    paddingLeft: 8,
    // required since ListItem has a default paddingRight
    paddingRight: 0
  }
});

export { TimelineOperationListItem, TimelineOperationListItemSkeleton };
