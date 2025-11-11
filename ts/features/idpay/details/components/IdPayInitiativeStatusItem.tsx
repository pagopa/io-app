import {
  Badge,
  Divider,
  H6,
  IOListItemStyles
} from "@pagopa/io-app-design-system";
import { ComponentProps } from "react";
import { View } from "react-native";
import I18n from "i18next";
import {
  StatusEnum,
  VoucherStatusEnum
} from "../../../../../definitions/idpay/InitiativeDTO";

const getStatusBadgeVariant = (
  status: StatusEnum | VoucherStatusEnum
): ComponentProps<typeof Badge>["variant"] => {
  switch (status) {
    case StatusEnum.REFUNDABLE:
    case StatusEnum.NOT_REFUNDABLE:
    case StatusEnum.NOT_REFUNDABLE_ONLY_IBAN:
    case StatusEnum.NOT_REFUNDABLE_ONLY_INSTRUMENT:
    case VoucherStatusEnum.ACTIVE:
      return "success";
    case StatusEnum.UNSUBSCRIBED:
    case VoucherStatusEnum.EXPIRED:
      return "error";
    case VoucherStatusEnum.EXPIRING:
      return "warning";
    case VoucherStatusEnum.USED:
    default:
      return "default";
  }
};

type IdPayInitiativeStatusItemProps = {
  status: StatusEnum;
  voucherStatus?: VoucherStatusEnum;
};

export const IdPayInitiativeStatusItem = ({
  status,
  voucherStatus
}: IdPayInitiativeStatusItemProps) => {
  const statusString = I18n.t(
    `idpay.initiative.details.initiativeCard.statusLabels.${
      voucherStatus ?? status
    }`
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
        <H6>
          {voucherStatus
            ? I18n.t("idpay.initiative.beneficiaryDetails.voucherStatus")
            : I18n.t("idpay.initiative.beneficiaryDetails.status")}
        </H6>
        <Badge
          text={statusString}
          variant={getStatusBadgeVariant(voucherStatus ?? status)}
        />
      </View>
      <Divider />
    </View>
  );
};
