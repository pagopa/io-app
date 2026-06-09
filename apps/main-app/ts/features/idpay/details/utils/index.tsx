import {
  LabelMini,
  Tag,
  useIOThemeContext
} from "@pagopa/io-app-design-system";
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
            weight="Regular"
            color={isDark ? "white" : "grey-650"}
            testID="idpay-card-status-active"
          >
            {I18n.t("idpay.wallet.card.validThrough", {
              endDate: format(initiative.voucherEndDate, "DD/MM/YY")
            })}
          </LabelMini>
        )
      );
    case VoucherStatusEnum.EXPIRING:
      return (
        initiative.voucherEndDate && (
          <Tag
            testID="idpay-card-status-expiring"
            variant="warning"
            text={I18n.t("bonusCard.expiring", {
              endDate: format(initiative.voucherEndDate, "DD/MM/YY")
            })}
          />
        )
      );
    case VoucherStatusEnum.EXPIRED:
      return (
        initiative.voucherEndDate && (
          <Tag
            testID="idpay-card-status-expired"
            variant="error"
            text={I18n.t("idpay.wallet.card.ended", {
              endDate: format(initiative.voucherEndDate, "DD/MM/YY")
            })}
          />
        )
      );
    case VoucherStatusEnum.USED:
      return (
        <Tag
          testID="idpay-card-status-used"
          variant="success"
          text={I18n.t("bonusCard.used")}
        />
      );
    default:
      return null;
  }
}
