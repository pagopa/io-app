import { LabelMini, Tag, useIOThemeContext } from "@io-app/design-system";
import I18n from "i18next";

import {
  InitiativeDTO,
  VoucherStatusEnum
} from "../../../../../definitions/idpay/InitiativeDTO";
import { format } from "../../../../utils/dates";

type InitiativeProps = {
  initiative: InitiativeDTO;
};

export function IdPayCardStatus({ initiative }: InitiativeProps) {
  const { themeType } = useIOThemeContext();
  const isDark = themeType === "dark";
  switch (initiative.voucherStatus) {
    case VoucherStatusEnum.ACTIVE:
      return (
        initiative.voucherEndDate && (
          <LabelMini
            color={isDark ? "white" : "grey-650"}
            testID="idpay-card-status-active"
            weight="Regular"
          >
            {I18n.t("idpay.wallet.card.validThrough", {
              endDate: format(initiative.voucherEndDate, "DD/MM/YY")
            })}
          </LabelMini>
        )
      );
    case VoucherStatusEnum.EXPIRED:
      return (
        initiative.voucherEndDate && (
          <Tag
            testID="idpay-card-status-expired"
            text={I18n.t("idpay.wallet.card.ended", {
              endDate: format(initiative.voucherEndDate, "DD/MM/YY")
            })}
            variant="error"
          />
        )
      );
    case VoucherStatusEnum.EXPIRING:
      return (
        initiative.voucherEndDate && (
          <Tag
            testID="idpay-card-status-expiring"
            text={I18n.t("bonusCard.expiring", {
              endDate: format(initiative.voucherEndDate, "DD/MM/YY")
            })}
            variant="warning"
          />
        )
      );
    case VoucherStatusEnum.USED:
      return (
        <Tag
          testID="idpay-card-status-used"
          text={I18n.t("bonusCard.used")}
          variant="success"
        />
      );
    default:
      return null;
  }
}
