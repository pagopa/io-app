import {
  Divider,
  ListItemHeader,
  ListItemInfo
} from "@pagopa/io-app-design-system";
import { FunctionComponent } from "react";
import I18n from "i18next";
import { Card } from "../../../../../../definitions/cgn/Card";
import { CardActivated } from "../../../../../../definitions/cgn/CardActivated";
import { CardExpired } from "../../../../../../definitions/cgn/CardExpired";
import { CardPending } from "../../../../../../definitions/cgn/CardPending";
import { CardRevoked } from "../../../../../../definitions/cgn/CardRevoked";
import { getAccessibleExpirationDate } from "../../utils/dates";
import { formatDateAsShortFormat } from "../../../../../utils/dates";

type Props = {
  cgnDetail: Card;
};

const CgnStatusDetail: FunctionComponent<Props> = ({ cgnDetail }: Props) => (
  <>
    <ListItemHeader label={I18n.t("bonus.cgn.detail.status.title")} />
    {!CardPending.is(cgnDetail) && (
      <>
        <ListItemInfo
          icon="calendar"
          label={I18n.t("bonus.cgn.detail.status.date.activated")}
          value={formatDateAsShortFormat(cgnDetail.activation_date)}
        />
        <Divider />
        {CardRevoked.is(cgnDetail) && (
          <ListItemInfo
            icon="calendar"
            label={I18n.t("bonus.cgn.detail.status.date.revoked")}
            value={formatDateAsShortFormat(cgnDetail.revocation_date)}
            accessibilityLabel={`${getAccessibleExpirationDate(
              cgnDetail.revocation_date,
              "revoked"
            )}`}
            endElement={{
              type: "badge",
              componentProps: {
                accessible: false,
                text: I18n.t("bonus.cgn.detail.status.badge.revoked"),
                variant: "error",
                testID: "status-badge"
              }
            }}
          />
        )}
        {CardExpired.is(cgnDetail) && (
          <ListItemInfo
            icon="calendar"
            label={I18n.t("bonus.cgn.detail.status.date.expired")}
            value={formatDateAsShortFormat(cgnDetail.expiration_date)}
            accessibilityLabel={`${getAccessibleExpirationDate(
              cgnDetail.expiration_date,
              "expired"
            )}`}
            endElement={{
              type: "badge",
              componentProps: {
                accessible: false,
                text: I18n.t("bonus.cgn.detail.status.badge.expired"),
                variant: "error",
                testID: "status-badge"
              }
            }}
          />
        )}
        {CardActivated.is(cgnDetail) && (
          <ListItemInfo
            icon="calendar"
            label={I18n.t("bonus.cgn.detail.status.expiration.cgn")}
            value={formatDateAsShortFormat(cgnDetail.expiration_date)}
            accessibilityLabel={`${getAccessibleExpirationDate(
              cgnDetail.expiration_date,
              "active"
            )}`}
            endElement={{
              type: "badge",
              componentProps: {
                accessible: false,
                text: I18n.t("bonus.cgn.detail.status.badge.active"),
                variant: "success",
                testID: "status-badge"
              }
            }}
          />
        )}
      </>
    )}
  </>
);

export default CgnStatusDetail;
