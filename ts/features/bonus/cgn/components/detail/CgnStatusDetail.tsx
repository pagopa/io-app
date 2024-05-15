import * as React from "react";
import {
  Divider,
  ListItemHeader,
  ListItemInfo
} from "@pagopa/io-app-design-system";
import { Card } from "../../../../../../definitions/cgn/Card";
import I18n from "../../../../../i18n";
import { localeDateFormat } from "../../../../../utils/locale";
import { CardPending } from "../../../../../../definitions/cgn/CardPending";
import { CardRevoked } from "../../../../../../definitions/cgn/CardRevoked";
import { CardExpired } from "../../../../../../definitions/cgn/CardExpired";
import { CardActivated } from "../../../../../../definitions/cgn/CardActivated";

type Props = {
  cgnDetail: Card;
};

const CgnStatusDetail: React.FunctionComponent<Props> = ({
  cgnDetail
}: Props) => (
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
            endElement={{
              type: "badge",
              componentProps: {
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
            endElement={{
              type: "badge",
              componentProps: {
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
            endElement={{
              type: "badge",
              componentProps: {
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
