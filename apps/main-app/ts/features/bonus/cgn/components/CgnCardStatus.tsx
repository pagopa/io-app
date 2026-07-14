import { LabelMini, Tag, useIOTheme } from "@io-app/design-system";
import I18n from "i18next";
import { Fragment } from "react";

import { Card } from "../../../../../definitions/cgn/Card";
import { CardActivated } from "../../../../../definitions/cgn/CardActivated";
import { CardExpired } from "../../../../../definitions/cgn/CardExpired";
import { CardRevoked } from "../../../../../definitions/cgn/CardRevoked";
import { formatDateAsShortFormat } from "../../../../utils/dates";

export function CgnCardStatus({ card }: { card: Card }) {
  const theme = useIOTheme();

  return (
    <Fragment>
      {CardRevoked.is(card) && (
        <Tag
          testID="card-status-revoked"
          text={I18n.t("bonus.cgn.detail.status.badge.revoked")}
          variant="error"
        />
      )}
      {CardExpired.is(card) && (
        <Tag
          testID="card-status-expired"
          text={I18n.t("bonus.cgn.detail.status.badge.expired")}
          variant="error"
        />
      )}
      {CardActivated.is(card) && (
        <LabelMini
          color={theme["textBody-tertiary"]}
          testID="card-bottom-content"
          weight="Regular"
        >
          {I18n.t("bonus.cgn.detail.status.date.valid_until", {
            date: formatDateAsShortFormat(card.expiration_date)
          })}
        </LabelMini>
      )}
    </Fragment>
  );
}
