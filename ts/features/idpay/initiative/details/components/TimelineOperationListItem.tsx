import { format } from "date-fns";
import { ListItem } from "native-base";
import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { OperationTypeEnum as IbanOperationTypeEnum } from "../../../../../../definitions/idpay/timeline/IbanOperationDTO";
import { OperationTypeEnum as OnboardingOperationTypeEnum } from "../../../../../../definitions/idpay/timeline/OnboardingOperationDTO";
import { OperationListDTO } from "../../../../../../definitions/idpay/timeline/OperationListDTO";
import { OperationTypeEnum as RefundOperationTypeEnum } from "../../../../../../definitions/idpay/timeline/RefundOperationDTO";
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

export const TimelineOperationListItem = (
  props: TimelineOperationListItemProps
) => {
  const { operation, onPress } = props;
  const hasAmount = "amount" in operation;

  const renderOperationIcon = (operation: OperationListDTO) => {
    if ("brandLogo" in operation) {
      return (
        <Image style={styles.imageSize} source={{ uri: operation.brandLogo }} />
      );
    }
    switch (operation.operationType) {
      case OnboardingOperationTypeEnum.ONBOARDING:
        return <Icon name={"bonus"} color="blue" />;
      case IbanOperationTypeEnum.ADD_IBAN:
        return <Icon name={"amount"} color="bluegreyLight" />;
      case RefundOperationTypeEnum.PAID_REFUND:
        return <Icon name={"reload"} color="bluegreyLight" />;
      case RefundOperationTypeEnum.REJECTED_REFUND:
        return <Icon name={"error"} color="bluegreyLight" />;
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
      {renderOperationIcon(operation)}
      <HSpacer size={16} />
      <View style={IOStyles.flex}>
        <H4>{renderOperationTitle()}</H4>
        <LabelSmall weight="Regular" color="bluegrey">
          {`${formatDateAsShortFormat(
            operation.operationDate
          )}, ${getHourAndMinuteFromDate(operation.operationDate)} ${
            hasAmount
              ? "· " + formatNumberAmount(Math.abs(operation.amount), true)
              : ""
          }`}
        </LabelSmall>
      </View>
      {hasAmount ? (
        <H4> {`${formatNumberAmount(operation.amount, false)} €`}</H4>
      ) : null}
    </ListItem>
  );
};
