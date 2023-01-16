import { ListItem, View } from "native-base";
import React from "react";
import { Image, StyleSheet } from "react-native";
import { OperationTypeEnum as IbanOperationTypeEnum } from "../../../../../../definitions/idpay/timeline/IbanOperationDTO";
import { OperationTypeEnum as RefundOperationTypeEnum } from "../../../../../../definitions/idpay/timeline/RefundOperationDTO";
import { OperationTypeEnum as OnboardingOperationTypeEnum } from "../../../../../../definitions/idpay/timeline/OnboardingOperationDTO";
import { H4 } from "../../../../../components/core/typography/H4";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { formatDateAsShortFormat } from "../../../../../utils/dates";
import { formatNumberAmount } from "../../../../../utils/stringBuilder";
import { OperationListDTO } from "../../../../../../definitions/idpay/timeline/OperationListDTO";
import { Icon } from "../../../../../components/core/icons";
import I18n from "../../../../../i18n";

const styles = StyleSheet.create({
  alignCenter: {
    alignItems: "center"
  },
  spaceBetween: {
    justifyContent: "space-between"
  },
  sidePadding: {
    paddingHorizontal: 8
  },
  imageSize: { height: 16, width: 24 }
});

const getHourAndMinuteFromDate = (date: Date) =>
  `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;

type TimelineOperationCardProps = {
  operation: OperationListDTO;
};

export const TimelineOperationListItem = ({
  operation
}: TimelineOperationCardProps) => {
  const hasAmount = "amount" in operation;
  return (
    <ListItem style={styles.spaceBetween}>
      <View
        style={[
          IOStyles.flex,
          IOStyles.row,
          styles.alignCenter,
          styles.sidePadding
        ]}
      >
        {renderOperationIcon(operation)}
        <View hspacer />
        <View style={IOStyles.flex}>
          <H4>
            {"maskedPan" in operation
              ? I18n.t(
                  `idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.operationDescriptions.${operation.operationType}`,
                  { maskedPan: operation.maskedPan }
                )
              : I18n.t(
                  `idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.operationDescriptions.${operation.operationType}`
                )}
          </H4>
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
      </View>
    </ListItem>
  );
};

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

