import { LabelMini, Tag } from "@pagopa/io-app-design-system";
import { Fragment } from "react";
import I18n from "i18next";
import { Card } from "../../../../../definitions/cgn/Card";
import { CardActivated } from "../../../../../definitions/cgn/CardActivated";
import { CardExpired } from "../../../../../definitions/cgn/CardExpired";
import { CardRevoked } from "../../../../../definitions/cgn/CardRevoked";
import { formatDateAsShortFormat } from "../../../../utils/dates";

export function CgnCardStatus({ card }: { card: Card }) {
  return (
    <Fragment>
      {CardRevoked.is(card) && (
        <Tag
          testID="card-status-revoked"
          variant="error"
          text={I18n.t("bonus.cgn.detail.status.badge.revoked")}
        />
      )}
      {CardExpired.is(card) && (
        <Tag
          testID="card-status-expired"
          variant="error"
          text={I18n.t("bonus.cgn.detail.status.badge.expired")}
        />
      )}
      {CardActivated.is(card) && (
        <LabelMini
          weight="Regular"
          color="grey-650"
          testID="card-bottom-content"
        >
          {I18n.t("bonus.cgn.detail.status.date.valid_until", {
            date: formatDateAsShortFormat(card.expiration_date)
          })}
        </LabelMini>
      )}
    </Fragment>
  );
}
