import { LabelMini, Tag } from "@pagopa/io-app-design-system";
import {
  InitiativeDTO,
  StatusEnum
} from "../../../../../definitions/idpay/InitiativeDTO";
import I18n from "../../../../i18n";
import { BonusStatus } from "../../../../components/BonusCard/type";
import { format } from "../../../../utils/dates";

type InitiativeProps = {
  initiative: InitiativeDTO;
};

export const getInitiativeStatus = ({
  initiative
}: InitiativeProps): BonusStatus => {
  if (initiative.status === StatusEnum.UNSUBSCRIBED) {
    return "REMOVED";
  }

  switch (initiative.voucherStatus) {
    case "USED":
      return "USED";
    case "EXPIRED":
      return "EXPIRED";
    case "ACTIVE":
      return "ACTIVE";
    case "EXPIRING":
      return "EXPIRING";
  }

  return "ACTIVE";
};

export function IdPayCardStatus({ initiative }: InitiativeProps) {
  switch (getInitiativeStatus({ initiative })) {
    case "ACTIVE":
      return (
        <LabelMini
          weight="Regular"
          color="grey-650"
          testID="idpay-card-status-active"
        >
          {I18n.t("bonusCard.validUntil", {
            endDate: format(initiative.voucherEndDate, "DD/MM/YY")
          })}
        </LabelMini>
      );
    case "EXPIRING":
      return (
        <Tag
          testID="idpay-card-status-expiring"
          variant="warning"
          text={I18n.t("bonusCard.expiring", {
            endDate: format(initiative.voucherEndDate, "DD/MM/YY")
          })}
        />
      );
    case "EXPIRED":
      return (
        <Tag
          testID="idpay-card-status-expired"
          variant="error"
          text={I18n.t("bonusCard.expired", {
            endDate: format(initiative.voucherEndDate, "DD/MM/YY")
          })}
        />
      );
    case "PAUSED":
      return (
        <Tag
          testID="idpay-card-status-paused"
          variant="info"
          text={I18n.t("bonusCard.paused")}
        />
      );
    case "REMOVED":
      return (
        <Tag
          testID="idpay-card-status-removed"
          variant="error"
          text={I18n.t("bonusCard.removed")}
        />
      );
    case "USED":
      return (
        <Tag
          testID="idpay-card-status-used"
          variant="success"
          text={I18n.t("bonusCard.used")}
        />
      );
  }
}
