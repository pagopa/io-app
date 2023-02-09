import { format } from "date-fns";
import { ListItem } from "native-base";
import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { OperationTypeEnum as IbanOperationTypeEnum } from "../../../../../../definitions/idpay/timeline/IbanOperationDTO";
import { OperationTypeEnum as OnboardingOperationTypeEnum } from "../../../../../../definitions/idpay/timeline/OnboardingOperationDTO";
import { OperationListDTO } from "../../../../../../definitions/idpay/timeline/OperationListDTO";
import { OperationTypeEnum as RefundOperationTypeEnum } from "../../../../../../definitions/idpay/timeline/RefundOperationDTO";
import { OperationTypeEnum } from "../../../../../../definitions/idpay/timeline/RejectedInstrumentOperationDTO";
import { OperationTypeEnum as TransactionOperationTypeEnum } from "../../../../../../definitions/idpay/timeline/TransactionOperationDTO";
import { Icon } from "../../../../../components/core/icons";
import { HSpacer } from "../../../../../components/core/spacer/Spacer";
import { H4 } from "../../../../../components/core/typography/H4";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import I18n from "../../../../../i18n";
import { formatDateAsShortFormat } from "../../../../../utils/dates";
import { formatNumberAmount } from "../../../../../utils/stringBuilder";

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
  },
  imageSize: { height: 16, width: 24 }
});

const getHourAndMinuteFromDate = (date: Date) => format(date, "HH:mm");

type TimelineOperationListItemProps = {
  operation: OperationListDTO;
  onPress?: () => void;
};

const generateTimelineOperationListItemData = (operation: OperationListDTO) => {
  const hasAmount = "amount" in operation;

  const OperationIcon = () => {
    switch (operation.operationType) {
      case OnboardingOperationTypeEnum.ONBOARDING:
        return <Icon name={"ok"} />;

      case IbanOperationTypeEnum.ADD_IBAN:
        return <Icon name={"institution"} color="bluegreyLight" />;

      case RefundOperationTypeEnum.PAID_REFUND:
        return <Icon name={"arrowCircleUp"} color="bluegrey" />;

      case OperationTypeEnum.REJECTED_ADD_INSTRUMENT:
      case OperationTypeEnum.REJECTED_DELETE_INSTRUMENT:
      case RefundOperationTypeEnum.REJECTED_REFUND:
        return <Icon name={"warning"} color="red" />;

      default:
        if ("brandLogo" in operation) {
          return (
            <Image
              style={styles.imageSize}
              source={{ uri: operation.brandLogo }}
            />
          );
        }
        return null;
    }
  };

  const OperationAmount = () => {
    if (!hasAmount) {
      return null;
    }
    switch (operation.operationType) {
      case TransactionOperationTypeEnum.TRANSACTION:
        return <H4> {`–${formatNumberAmount(operation.amount, false)} €`}</H4>;
      case TransactionOperationTypeEnum.REVERSAL:
        return <H4> {`+${formatNumberAmount(operation.amount, false)} €`}</H4>;
      case RefundOperationTypeEnum.PAID_REFUND:
        return (
          <H4 color="greenLight">
            {" "}
            {`${formatNumberAmount(operation.amount, false)} €`}
          </H4>
        );
      default:
        return null;
    }
  };

  const renderOperationTitle = () =>
    "maskedPan" in operation
      ? I18n.t(
          `idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.operationDescriptions.${operation.operationType}`,
          { maskedPan: operation.maskedPan }
        )
      : I18n.t(
          `idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.operationDescriptions.${operation.operationType}`
        );

  const renderOperationInvoiceAmount = () => {
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
    OperationIcon,
    OperationAmount,
    renderOperationTitle,
    renderOperationInvoiceAmount
  };
};

export const TimelineOperationListItem = (
  props: TimelineOperationListItemProps
) => {
  const { operation, onPress } = props;
  const {
    OperationIcon,
    OperationAmount,
    renderOperationTitle,
    renderOperationInvoiceAmount
  } = generateTimelineOperationListItemData(operation);
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
      <OperationIcon />
      <HSpacer size={16} />
      <View style={IOStyles.flex}>
        <H4>{renderOperationTitle()}</H4>
        <LabelSmall weight="Regular" color="bluegrey">
          {`${formatDateAsShortFormat(
            operation.operationDate
          )}, ${getHourAndMinuteFromDate(
            operation.operationDate
          )} ${renderOperationInvoiceAmount()}`}
        </LabelSmall>
      </View>
      <OperationAmount />
    </ListItem>
  );
};
