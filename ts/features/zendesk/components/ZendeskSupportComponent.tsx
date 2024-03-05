import {
  ButtonOutline,
  ButtonSolid,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { InitializedProfile } from "../../../../definitions/backend/InitializedProfile";
import { IOToast } from "../../../components/Toast";
import { InfoBox } from "../../../components/box/InfoBox";
import { H3 } from "../../../components/core/typography/H3";
import { H4 } from "../../../components/core/typography/H4";
import { Label } from "../../../components/core/typography/Label";
import { Link } from "../../../components/core/typography/Link";
import { zendeskPrivacyUrl } from "../../../config";
import I18n from "../../../i18n";
import { mixpanelTrack } from "../../../mixpanel";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../store/hooks";
import {
  isProfileEmailValidatedSelector,
  profileSelector
} from "../../../store/reducers/profile";
import { openWebUrl } from "../../../utils/url";
import ZENDESK_ROUTES from "../navigation/routes";
import { zendeskConfigSelector } from "../store/reducers";
import { handleContactSupport } from "../utils";

type Props = {
  assistanceForPayment: boolean;
  assistanceForCard: boolean;
  assistanceForFci: boolean;
};

/**
 * This component represents the entry point for the Zendesk workflow.
 * It has 2 buttons that respectively allow a user to open a ticket and see the already opened tickets.
 *
 * Here is managed the initialization of the Zendesk SDK and is chosen the config to use between authenticated or anonymous.
 * If the panic mode is active in the remote Zendesk config pressing the open a ticket button, the user will be sent to the ZendeskPanicMode
 * @constructor
 */
const ZendeskSupportComponent = ({
  assistanceForPayment,
  assistanceForCard,
  assistanceForFci
}: Props) => {
  const profile = useIOSelector(profileSelector);
  const maybeProfile: O.Option<InitializedProfile> = pot.toOption(profile);
  const zendeskRemoteConfig = useIOSelector(zendeskConfigSelector);
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const isEmailValidated = useIOSelector(isProfileEmailValidatedSelector);

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

  const showRequestSupportButtons = isEmailValidated || !pot.isSome(profile);

  return (
    <>
      <H3>{I18n.t("support.helpCenter.supportComponent.title")}</H3>
      <VSpacer size={16} />
      <H4 weight={"Regular"}>
        {I18n.t("support.helpCenter.supportComponent.subtitle")}{" "}
        <Link
          onPress={() => {
            openWebUrl(zendeskPrivacyUrl, () =>
              IOToast.error(I18n.t("global.jserror.title"))
            );
          }}
        >
          {I18n.t("support.askPermissions.privacyLink")}
        </Link>
      </H4>
      <VSpacer size={24} />
      <InfoBox iconName="notice" iconColor="blue" iconSize={20}>
        <Label color={"bluegrey"} weight={"Regular"}>
          {I18n.t("support.helpCenter.supportComponent.adviceMessage")}
        </Label>
      </InfoBox>
      <VSpacer size={16} />

      {showRequestSupportButtons && (
        <>
          <ButtonOutline
            fullWidth
            onPress={() => {
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
            }}
            testID={"showTicketsButton"}
            label={I18n.t("support.helpCenter.cta.seeReports")}
            accessibilityLabel={I18n.t("support.helpCenter.cta.seeReports")}
          />
          <VSpacer size={16} />
          <ButtonSolid
            fullWidth
            label={I18n.t("support.helpCenter.cta.contactSupport")}
            accessibilityLabel={I18n.t("support.helpCenter.cta.contactSupport")}
            onPress={handleContactSupportPress}
            testID={"contactSupportButton"}
          />
        </>
      )}
    </>
  );
};

export default ZendeskSupportComponent;
