import {
  Badge,
  Divider,
  H6,
  IOListItemStyles
} from "@pagopa/io-app-design-system";
import { ComponentProps } from "react";
import { View } from "react-native";
import { StatusEnum } from "../../../../../definitions/idpay/InitiativeDTO";
import I18n from "../../../../i18n";

const getStatusBadgeVariant = (
  status: StatusEnum
): ComponentProps<typeof Badge>["variant"] => {
  switch (status) {
    case StatusEnum.REFUNDABLE:
    case StatusEnum.NOT_REFUNDABLE:
    case StatusEnum.NOT_REFUNDABLE_ONLY_IBAN:
    case StatusEnum.NOT_REFUNDABLE_ONLY_INSTRUMENT:
      return "success";
    case StatusEnum.UNSUBSCRIBED:
      return "error";
    default:
      return "default";
  }
};

type IdPayinitiativeStatusItemProps = {
  status: StatusEnum;
};

export const IdPayinitiativeStatusItem = ({
  status
}: IdPayinitiativeStatusItemProps) => {
  const statusString = I18n.t(
    `idpay.initiative.details.initiativeCard.statusLabels.${status}`
  );

  return (
    <View testID="statusTestID">
      <View
        style={{
          ...IOListItemStyles.listItem,
          justifyContent: "space-between",
          flexDirection: "row"
        }}
      >
        <H6>{I18n.t("idpay.initiative.beneficiaryDetails.status")}</H6>
        <Badge text={statusString} variant={getStatusBadgeVariant(status)} />
      </View>
      <Divider />
    </View>
  );
};
