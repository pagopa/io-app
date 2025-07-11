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

  if (now > initiative.endDate) {
    return "EXPIRED";
  }

  const next7Days = new Date(new Date(now).setDate(now.getDate() + 7));
  if (next7Days > initiative.endDate) {
    return "EXPIRING";
  }

  return "ACTIVE";
};

const isEndOfTheDay = (date: Date): boolean => {
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59);
  return date.getTime() === endOfDay.getTime();
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
          {isEndOfTheDay(initiative.endDate)
            ? I18n.t("bonusCard.validUntilWithDate", {
                endDate: format(initiative.endDate, "DD/MM/YY")
              })
            : I18n.t("bonusCard.validUntil")}
        </LabelMini>
      );

    case "EXPIRING":
      return isEndOfTheDay(initiative.endDate) ? (
        <Tag
          testID="idpay-card-status-expiring"
          variant="warning"
          text={I18n.t("bonusCard.expiringWithDate", {
            endDate: format(initiative.endDate, "DD/MM/YY")
          })}
        />
      ) : (
        <Tag
          testID="idpay-card-status-expired"
          variant="error"
          text={I18n.t("bonusCard.expiring")}
        />
      );
    case "EXPIRED":
      return isEndOfTheDay(initiative.endDate) ? (
        <Tag
          testID="idpay-card-status-expired"
          variant="error"
          text={I18n.t("bonusCard.expiredWithDate", {
            endDate: format(initiative.endDate, "DD/MM/YY")
          })}
        />
      ) : (
        <Tag
          testID="idpay-card-status-expired"
          variant="error"
          text={I18n.t("bonusCard.expired")}
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
  }
}
