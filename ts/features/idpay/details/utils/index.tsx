import { LabelMini, Tag } from "@pagopa/io-app-design-system";
import {
  InitiativeDTO,
  StatusEnum
} from "../../../../../definitions/idpay/InitiativeDTO";
import I18n from "../../../../i18n";
import { BonusStatus } from "../../../../components/BonusCard/type";
import { format } from "../../../../utils/dates";

type InitiativeProps = {
  now: Date;
  initiative: InitiativeDTO;
};

export const getInitiativeStatus = ({
  initiative,
  now
}: InitiativeProps): BonusStatus => {
  if (initiative.status === StatusEnum.UNSUBSCRIBED) {
    return "REMOVED";
  }
  // TODO replace with initiative.status === "USED" when the API is updated
  if (initiative.status === StatusEnum.SUSPENDED) {
    return "USED";
  }

  if (now > initiative.endDate) {
    return "EXPIRED";
  }

  const next7Days = new Date(new Date(now).setDate(now.getDate() + 7));
  if (next7Days > initiative.endDate) {
    return "EXPIRING";
  }

  return "ACTIVE";
};

export function IdPayCardStatus({ now, initiative }: InitiativeProps) {
  switch (getInitiativeStatus({ now, initiative })) {
    case "ACTIVE":
      return (
        <LabelMini
          weight="Regular"
          color="grey-650"
          testID="idpay-card-status-active"
        >
          {I18n.t("bonusCard.validUntil", {
            endDate: format(initiative.endDate, "DD/MM/YY")
          })}
        </LabelMini>
      );
    case "EXPIRING":
      return (
        <Tag
          testID="idpay-card-status-expiring"
          variant="warning"
          text={I18n.t("bonusCard.expiring", {
            endDate: format(initiative.endDate, "DD/MM/YY")
          })}
        />
      );
    case "EXPIRED":
      return (
        <Tag
          testID="idpay-card-status-expired"
          variant="error"
          text={I18n.t("bonusCard.expired", {
            endDate: format(initiative.endDate, "DD/MM/YY")
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
