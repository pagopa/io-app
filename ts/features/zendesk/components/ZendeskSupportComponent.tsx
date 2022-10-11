import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { View } from "native-base";
import * as React from "react";
import { InitializedProfile } from "../../../../definitions/backend/InitializedProfile";
import AdviceComponent from "../../../components/AdviceComponent";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import { H3 } from "../../../components/core/typography/H3";
import { H4 } from "../../../components/core/typography/H4";
import { Label } from "../../../components/core/typography/Label";
import { Link } from "../../../components/core/typography/Link";
import I18n from "../../../i18n";
import { mixpanelTrack } from "../../../mixpanel";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../store/hooks";
import { profileSelector } from "../../../store/reducers/profile";
import { showToast } from "../../../utils/showToast";
import { isPanicModeActive } from "../../../utils/supportAssistance";
import { openWebUrl } from "../../../utils/url";
import { isReady } from "../../bonus/bpd/model/RemoteValue";
import ZENDESK_ROUTES from "../navigation/routes";
import { zendeskConfigSelector } from "../store/reducers";

type Props = {
  assistanceForPayment: boolean;
};

const POLICY_URL = "https://www.pagopa.it/it/privacy-policy-assistenza/";

/**
 * This component represents the entry point for the Zendesk workflow.
 * It has 2 buttons that respectively allow a user to open a ticket and see the already opened tickets.
 *
 * Here is managed the initialization of the Zendesk SDK and is chosen the config to use between authenticated or anonymous.
 * If the panic mode is active in the remote Zendesk config pressing the open a ticket button, the user will be sent to the ZendeskPanicMode
 * @constructor
 */
const ZendeskSupportComponent = (props: Props) => {
  const { assistanceForPayment } = props;
  const profile = useIOSelector(profileSelector);
  const maybeProfile: O.Option<InitializedProfile> = pot.toOption(profile);
  const zendeskRemoteConfig = useIOSelector(zendeskConfigSelector);
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  const handleContactSupportPress = () => {
    const canSkipCategoryChoice: boolean =
      !isReady(zendeskRemoteConfig) || assistanceForPayment;

    if (isPanicModeActive(zendeskRemoteConfig)) {
      // Go to panic mode screen
      navigation.navigate(ZENDESK_ROUTES.MAIN, {
        screen: ZENDESK_ROUTES.PANIC_MODE
      });
      return;
    }

    if (canSkipCategoryChoice) {
      navigation.navigate(ZENDESK_ROUTES.MAIN, {
        screen: ZENDESK_ROUTES.ASK_PERMISSIONS,
        params: { assistanceForPayment }
      });
    } else {
      navigation.navigate(ZENDESK_ROUTES.MAIN, {
        screen: ZENDESK_ROUTES.CHOOSE_CATEGORY,
        params: { assistanceForPayment }
      });
    }
  };

  return (
    <>
      <H3>{I18n.t("support.helpCenter.supportComponent.title")}</H3>
      <View spacer={true} />
      <H4 weight={"Regular"}>
        {I18n.t("support.helpCenter.supportComponent.subtitle")}{" "}
        <Link
          onPress={() => {
            openWebUrl(POLICY_URL, () =>
              showToast(I18n.t("global.jserror.title"))
            );
          }}
        >
          {I18n.t("support.askPermissions.privacyLink")}
        </Link>
      </H4>
      <View spacer={true} large={true} />
      <AdviceComponent
        text={I18n.t("support.helpCenter.supportComponent.adviceMessage")}
      />
      <View spacer={true} />

      <ButtonDefaultOpacity
        onPress={() => {
          void mixpanelTrack("ZENDESK_SHOW_TICKETS_STARTS");
          if (O.isNone(maybeProfile)) {
            navigation.navigate(ZENDESK_ROUTES.MAIN, {
              screen: ZENDESK_ROUTES.SEE_REPORTS_ROUTERS,
              params: { assistanceForPayment }
            });
          } else {
            navigation.navigate(ZENDESK_ROUTES.MAIN, {
              screen: ZENDESK_ROUTES.ASK_SEE_REPORTS_PERMISSIONS,
              params: { assistanceForPayment }
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
      <View spacer={true} />

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
