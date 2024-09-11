import React from "react";
import { Tag, Chip } from "@pagopa/io-app-design-system";
import { CardActivated } from "../../../../../definitions/cgn/CardActivated";
import I18n from "../../../../i18n";
import { CardRevoked } from "../../../../../definitions/cgn/CardRevoked";
import { CardExpired } from "../../../../../definitions/cgn/CardExpired";
import { formatDateAsShortFormat } from "../../../../utils/dates";
import { Card } from "../../../../../definitions/cgn/Card";

export function CgnCardStatus({ card }: { card: Card }) {
  return (
    <React.Fragment>
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
        <Chip color="grey-650" testID="card-bottom-content">
          {I18n.t("bonus.cgn.detail.status.date.valid_until", {
            date: formatDateAsShortFormat(card.expiration_date)
          })}
        </Chip>
      )}
    </React.Fragment>
  );
}
