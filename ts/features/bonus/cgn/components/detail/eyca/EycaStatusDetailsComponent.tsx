import {
  ListItemInfo,
  ListItemInfoCopy,
  Divider
} from "@pagopa/io-app-design-system";
import { EycaCardActivated } from "../../../../../../../definitions/cgn/EycaCardActivated";
import { EycaCardExpired } from "../../../../../../../definitions/cgn/EycaCardExpired";
import { EycaCardRevoked } from "../../../../../../../definitions/cgn/EycaCardRevoked";

import I18n from "../../../../../../i18n";
import { localeDateFormat } from "../../../../../../utils/locale";
import { clipboardSetStringWithFeedback } from "../../../../../../utils/clipboard";

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
      value={props.eycaCard.card_number}
      testID="eyca-card-number"
      onPress={() => clipboardSetStringWithFeedback(props.eycaCard.card_number)}
    />
    <Divider />
    <ListItemInfo
      icon="calendar"
      label={I18n.t("bonus.cgn.detail.status.expiration.cgn")}
      value={localeDateFormat(
        props.eycaCard.expiration_date,
        I18n.t("global.dateFormats.shortFormat")
      )}
      accessibilityLabel={`${I18n.t(
        "bonus.cgn.detail.status.expiration.cgn"
      )}: ${localeDateFormat(
        props.eycaCard.expiration_date,
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
          testID: "eyca-status-badge"
        }
      }}
    />
  </>
);

export default EycaStatusDetailsComponent;
