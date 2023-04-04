import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { InitializedProfile } from "../../../../definitions/backend/InitializedProfile";
import { InfoBox } from "../../../components/box/InfoBox";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import { VSpacer } from "../../../components/core/spacer/Spacer";
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
import { profileSelector } from "../../../store/reducers/profile";
import { showToast } from "../../../utils/showToast";
import { openWebUrl } from "../../../utils/url";
import ZENDESK_ROUTES from "../navigation/routes";
import { zendeskConfigSelector } from "../store/reducers";
import { handleContactSupport } from "../utils";

type Props = {
  assistanceForPayment: boolean;
  assistanceForCard: boolean;
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
  assistanceForCard
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
        zendeskRemoteConfig
      ),
    [navigation, assistanceForPayment, assistanceForCard, zendeskRemoteConfig]
  );

  return (
    <>
      <H3>{I18n.t("support.helpCenter.supportComponent.title")}</H3>
      <VSpacer size={16} />
      <H4 weight={"Regular"}>
        {I18n.t("support.helpCenter.supportComponent.subtitle")}{" "}
        <Link
          onPress={() => {
            openWebUrl(zendeskPrivacyUrl, () =>
              showToast(I18n.t("global.jserror.title"))
            );
          }}
        >
          {I18n.t("support.askPermissions.privacyLink")}
        </Link>
      </H4>
      <VSpacer size={24} />
      <InfoBox iconName="notice" iconColor="blue" iconSize={16}>
        <Label color={"bluegrey"} weight={"Regular"}>
          {I18n.t("support.helpCenter.supportComponent.adviceMessage")}
        </Label>
      </InfoBox>
      <VSpacer size={16} />

      <ButtonDefaultOpacity
        onPress={() => {
          void mixpanelTrack("ZENDESK_SHOW_TICKETS_STARTS");
          if (O.isNone(maybeProfile)) {
            navigation.navigate(ZENDESK_ROUTES.MAIN, {
              screen: ZENDESK_ROUTES.SEE_REPORTS_ROUTERS,
              params: { assistanceForPayment, assistanceForCard }
            });
          } else {
            navigation.navigate(ZENDESK_ROUTES.MAIN, {
              screen: ZENDESK_ROUTES.ASK_SEE_REPORTS_PERMISSIONS,
              params: { assistanceForPayment, assistanceForCard }
            });
          }
        }}
        style={{
          alignSelf: "stretch"
        }}
        disabled={false}
        bordered={true}
        testID={"showTicketsButton"}
      >
        <Label>{I18n.t("support.helpCenter.cta.seeReports")}</Label>
      </ButtonDefaultOpacity>
      <VSpacer size={16} />

      <ButtonDefaultOpacity
        style={{
          alignSelf: "stretch"
        }}
        onPress={handleContactSupportPress}
        disabled={false}
        testID={"contactSupportButton"}
      >
        <Label color={"white"}>
          {I18n.t("support.helpCenter.cta.contactSupport")}
        </Label>
      </ButtonDefaultOpacity>
    </>
  );
};

export default ZendeskSupportComponent;
