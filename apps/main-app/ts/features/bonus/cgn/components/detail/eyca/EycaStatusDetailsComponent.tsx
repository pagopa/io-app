import {
  Divider,
  ListItemInfo,
  ListItemInfoCopy
} from "@pagopa/io-app-design-system";
import I18n from "i18next";

import { EycaCardActivated } from "../../../../../../../definitions/cgn/EycaCardActivated";
import { EycaCardExpired } from "../../../../../../../definitions/cgn/EycaCardExpired";
import { EycaCardRevoked } from "../../../../../../../definitions/cgn/EycaCardRevoked";
import { clipboardSetStringWithFeedback } from "../../../../../../utils/clipboard";
import { formatDateAsShortFormat } from "../../../../../../utils/dates";
import { getAccessibleExpirationDate } from "../../../utils/dates";

type Props = {
  eycaCard: EycaCardActivated | EycaCardExpired | EycaCardRevoked;
};

// this component shows EYCA card details related to user's CGN
const EycaStatusDetailsComponent = (props: Props) => (
  <>
    <ListItemInfoCopy
      accessibilityLabel={I18n.t("bonus.cgn.detail.cta.eyca.copy")}
      icon="creditCard"
      label={I18n.t("bonus.cgn.detail.status.eycaNumber")}
      onPress={() => clipboardSetStringWithFeedback(props.eycaCard.card_number)}
      testID="eyca-card-number"
      value={props.eycaCard.card_number}
    />
    <Divider />
    <ListItemInfo
      accessibilityLabel={getAccessibleExpirationDate(
        props.eycaCard.expiration_date,
        "active"
      )}
      endElement={{
        type: "badge",
        componentProps: {
          accessible: false,
          text: I18n.t("bonus.cgn.detail.status.badge.active"),
          variant: "success",
          testID: "eyca-status-badge"
        }
      }}
      icon="calendar"
      label={I18n.t("bonus.cgn.detail.status.expiration.cgn")}
      value={formatDateAsShortFormat(props.eycaCard.expiration_date)}
    />
  </>
);

export default EycaStatusDetailsComponent;
