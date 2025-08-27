import {
  LabelMini,
  Tag,
  useIOThemeContext
} from "@pagopa/io-app-design-system";
import {
  InitiativeDTO,
  VoucherStatusEnum
} from "../../../../../definitions/idpay/InitiativeDTO";
import I18n from "../../../../i18n";
import { format } from "../../../../utils/dates";

type InitiativeProps = {
  initiative: InitiativeDTO;
};

export function IdPayCardStatus({ initiative }: InitiativeProps) {
  switch (initiative.voucherStatus) {
    case VoucherStatusEnum.ACTIVE:
      return (
        initiative.voucherEndDate && (
          <LabelMini
            weight="Regular"
            color="grey-650"
            testID="idpay-card-status-active"
          >
            {I18n.t("bonusCard.validUntil", {
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
            text={I18n.t("bonusCard.expired", {
              endDate: format(initiative.voucherEndDate, "DD/MM/YY")
            })}
          />
        )
      );
    // TODO: Add the used tag
    case VoucherStatusEnum.USED:
    default:
      return (
        <Tag
          testID="idpay-card-status-paused"
          variant="info"
          text={I18n.t("bonusCard.paused")}
        />
      );
  }
}
