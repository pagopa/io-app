import { Card } from "@io-app/api-types/generated/definitions/cgn/Card";
import { CardActivated } from "@io-app/api-types/generated/definitions/cgn/CardActivated";
import { CardExpired } from "@io-app/api-types/generated/definitions/cgn/CardExpired";
import { CardRevoked } from "@io-app/api-types/generated/definitions/cgn/CardRevoked";
import { LabelMini, Tag, useIOTheme } from "@io-app/design-system";
import I18n from "i18next";
import { Fragment } from "react";

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
