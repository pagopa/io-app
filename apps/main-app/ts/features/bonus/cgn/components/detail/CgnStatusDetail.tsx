import { Card } from "@io-app/api-types/generated/definitions/cgn/Card";
import { CardActivated } from "@io-app/api-types/generated/definitions/cgn/CardActivated";
import { CardExpired } from "@io-app/api-types/generated/definitions/cgn/CardExpired";
import { CardPending } from "@io-app/api-types/generated/definitions/cgn/CardPending";
import { CardRevoked } from "@io-app/api-types/generated/definitions/cgn/CardRevoked";
import { Divider, ListItemHeader, ListItemInfo } from "@io-app/design-system";
import I18n from "i18next";
import { FunctionComponent } from "react";
import { View } from "react-native";

import { formatDateAsShortFormat } from "../../../../../utils/dates";
import { getAccessibleExpirationDate } from "../../utils/dates";

type Props = {
  cgnDetail: Card;
};

const CgnStatusDetail: FunctionComponent<Props> = ({ cgnDetail }: Props) => (
  <View>
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
            icon="calendar"
            label={I18n.t("bonus.cgn.detail.status.date.revoked")}
            value={formatDateAsShortFormat(cgnDetail.revocation_date)}
          />
        )}
        {CardExpired.is(cgnDetail) && (
          <ListItemInfo
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
            icon="calendar"
            label={I18n.t("bonus.cgn.detail.status.date.expired")}
            value={formatDateAsShortFormat(cgnDetail.expiration_date)}
          />
        )}
        {CardActivated.is(cgnDetail) && (
          <ListItemInfo
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
            icon="calendar"
            label={I18n.t("bonus.cgn.detail.status.expiration.cgn")}
            value={formatDateAsShortFormat(cgnDetail.expiration_date)}
          />
        )}
      </>
    )}
  </View>
);

export default CgnStatusDetail;
