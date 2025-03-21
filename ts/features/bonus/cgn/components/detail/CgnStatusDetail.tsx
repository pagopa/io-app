import {
  Divider,
  ListItemHeader,
  ListItemInfo
} from "@pagopa/io-app-design-system";
import { FunctionComponent } from "react";
import { Card } from "../../../../../../definitions/cgn/Card";
import { CardActivated } from "../../../../../../definitions/cgn/CardActivated";
import { CardExpired } from "../../../../../../definitions/cgn/CardExpired";
import { CardPending } from "../../../../../../definitions/cgn/CardPending";
import { CardRevoked } from "../../../../../../definitions/cgn/CardRevoked";
import I18n from "../../../../../i18n";
import { localeDateFormat } from "../../../../../utils/locale";

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
          value={localeDateFormat(
            cgnDetail.activation_date,
            I18n.t("global.dateFormats.shortFormat")
          )}
        />
        <Divider />
        {CardRevoked.is(cgnDetail) && (
          <ListItemInfo
            icon="calendar"
            label={I18n.t("bonus.cgn.detail.status.date.revoked")}
            value={localeDateFormat(
              cgnDetail.revocation_date,
              I18n.t("global.dateFormats.shortFormat")
            )}
            accessibilityLabel={`${I18n.t(
              "bonus.cgn.detail.status.date.revoked"
            )}: ${localeDateFormat(
              cgnDetail.revocation_date,
              I18n.t("global.dateFormats.shortFormat")
            )}. ${I18n.t("bonus.cgn.detail.status.a11y.cardStatus", {
              status: I18n.t("bonus.cgn.detail.status.badge.revoked")
            })}`}
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
            value={localeDateFormat(
              cgnDetail.expiration_date,
              I18n.t("global.dateFormats.shortFormat")
            )}
            accessibilityLabel={`${I18n.t(
              "bonus.cgn.detail.status.expiration.cgn"
            )}: ${localeDateFormat(
              cgnDetail.expiration_date,
              I18n.t("global.dateFormats.shortFormat")
            )}. ${I18n.t("bonus.cgn.detail.status.a11y.cardStatus", {
              status: I18n.t("bonus.cgn.detail.status.badge.expired")
            })}`}
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
            value={localeDateFormat(
              cgnDetail.expiration_date,
              I18n.t("global.dateFormats.shortFormat")
            )}
            accessibilityLabel={`${I18n.t(
              "bonus.cgn.detail.status.expiration.cgn"
            )}: ${localeDateFormat(
              cgnDetail.expiration_date,
              I18n.t("global.dateFormats.shortFormat")
            )}. ${I18n.t("bonus.cgn.detail.status.a11y.cardStatus", {
              status: I18n.t("bonus.cgn.detail.status.badge.active")
            })}`}
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
