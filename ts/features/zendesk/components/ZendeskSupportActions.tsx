import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { InitializedProfile } from "../../../../definitions/backend/InitializedProfile";
import {
  FooterActions,
  FooterActionsMeasurements
} from "../../../components/ui/FooterActions";
import I18n from "../../../i18n";
import { mixpanelTrack } from "../../../mixpanel";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../store/hooks";
import { profileSelector } from "../../../store/reducers/profile";
import ZENDESK_ROUTES from "../navigation/routes";
import { zendeskConfigSelector } from "../store/reducers";
import { handleContactSupport } from "../utils";

type Props = {
  assistanceForPayment: boolean;
  assistanceForCard: boolean;
  assistanceForFci: boolean;
  onMeasure: (measurements: FooterActionsMeasurements) => void;
};

/**
 * This component represents the entry point for the Zendesk workflow.
 * It has 2 buttons that respectively allow a user to open a ticket and see the already opened tickets.
 *
 * Here is managed the initialization of the Zendesk SDK and is chosen the config to use between authenticated or anonymous.
 * If the panic mode is active in the remote Zendesk config pressing the open a ticket button, the user will be sent to the ZendeskPanicMode
 * @constructor
 */
const ZendeskSupportActions = ({
  assistanceForPayment,
  assistanceForCard,
  assistanceForFci,
  onMeasure
}: Props) => {
  const profile = useIOSelector(profileSelector);
  const maybeProfile: O.Option<InitializedProfile> = pot.toOption(profile);
  const zendeskRemoteConfig = useIOSelector(zendeskConfigSelector);
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  const handleContactSupportPress = React.useCallback(
    () =>
      handleContactSupport(
        navigation,
        assistanceForPayment,
        assistanceForCard,
        assistanceForFci,
        zendeskRemoteConfig
      ),
    [
      navigation,
      assistanceForPayment,
      assistanceForCard,
      assistanceForFci,
      zendeskRemoteConfig
    ]
  );

  return (
    <FooterActions
      onMeasure={onMeasure}
      actions={{
        type: "TwoButtons",
        primary: {
          testID: "contactSupportButton",
          label: I18n.t("support.helpCenter.cta.contactSupport"),
          onPress: handleContactSupportPress
        },
        secondary: {
          testID: "showTicketsButton",
          label: I18n.t("support.helpCenter.cta.seeReports"),
          onPress: () => {
            void mixpanelTrack("ZENDESK_SHOW_TICKETS_STARTS");
            if (O.isNone(maybeProfile)) {
              navigation.navigate(ZENDESK_ROUTES.MAIN, {
                screen: ZENDESK_ROUTES.SEE_REPORTS_ROUTERS,
                params: {
                  assistanceForPayment,
                  assistanceForCard,
                  assistanceForFci
                }
              });
            } else {
              navigation.navigate(ZENDESK_ROUTES.MAIN, {
                screen: ZENDESK_ROUTES.ASK_SEE_REPORTS_PERMISSIONS,
                params: {
                  assistanceForPayment,
                  assistanceForCard,
                  assistanceForFci
                }
              });
            }
          }
        }
      }}
    />
  );
};

export default ZendeskSupportActions;
