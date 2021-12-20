import * as React from "react";
import { useEffect } from "react";
import * as pot from "italia-ts-commons/lib/pot";
import { fromNullable, Option } from "fp-ts/lib/Option";
import { useDispatch } from "react-redux";
import { H3, View } from "native-base";
import { zendeskTokenSelector } from "../../../store/reducers/authentication";
import {
  AnonymousIdentity,
  initSupportAssistance,
  isPanicModeActive,
  JwtIdentity,
  setUserIdentity,
  showSupportTickets,
  ZendeskAppConfig,
  zendeskDefaultAnonymousConfig,
  zendeskDefaultJwtConfig
} from "../../../utils/supportAssistance";
import { profileSelector } from "../../../store/reducers/profile";
import { InitializedProfile } from "../../../../definitions/backend/InitializedProfile";
import { useIOSelector } from "../../../store/hooks";
import {
  navigateToZendeskAskPermissions,
  navigateToZendeskPanicMode
} from "../store/actions/navigation";
import { useNavigationContext } from "../../../utils/hooks/useOnFocus";
import { zendeskSupportCompleted } from "../store/actions";
import I18n from "../../../i18n";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import { Label } from "../../../components/core/typography/Label";
import AdviceComponent from "../../../components/AdviceComponent";
import { H4 } from "../../../components/core/typography/H4";
import { zendeskConfigSelector } from "../store/reducers";

type Props = {
  assistanceForPayment: boolean;
};
/**
 * This component represents the entry point for the Zendesk workflow.
 * It has 2 buttons that respectively allow a user to open a ticket and see the already opened tickets.
 *
 * Here is managed the initialization of the Zendesk SDK and is chosen the config to use between authenticated or anonymous.
 * If the panic mode is active in the remote Zendesk config pressing the open a ticket button, the user will be sent to the {@link ZendeskPanicMode}
 * @constructor
 */
const ZendeskSupportComponent = (props: Props) => {
  const { assistanceForPayment } = props;
  const zendeskToken = useIOSelector(zendeskTokenSelector);
  const profile = useIOSelector(profileSelector);
  const zendeskRemoteConfig = useIOSelector(zendeskConfigSelector);
  const navigation = useNavigationContext();
  const dispatch = useDispatch();
  const workUnitCompleted = () => dispatch(zendeskSupportCompleted());

  const [zendeskConfig, setZendeskConfig] = React.useState<ZendeskAppConfig>(
    zendeskToken
      ? { ...zendeskDefaultJwtConfig, token: zendeskToken }
      : zendeskDefaultAnonymousConfig
  );

  useEffect(() => {
    const maybeProfile: Option<InitializedProfile> = pot.toOption(profile);

    setZendeskConfig(
      zendeskToken
        ? { ...zendeskDefaultJwtConfig, token: zendeskToken }
        : zendeskDefaultAnonymousConfig
    );
    initSupportAssistance(zendeskConfig);

    // In Zendesk we have two configuration: JwtConfig and AnonymousConfig.
    // The AnonymousConfig is used both for the users authenticated with name and email and for the anonymous user.
    // Since the zendesk session token and the profile are provided by two different endpoint
    // we sequentially check both:
    // - if the zendeskToken is present the user will be authenticated via jwt
    // - if the zendeskToken is not present but there is the profile,
    //   the user will be authenticated, in anonymous mode, with the profile data (if available)
    // - as last nothing is available (the user is not authenticated in IO) the user will be totally anonymous also in Zendesk
    const zendeskIdentity = fromNullable(zendeskToken)
      .map((zT: string): JwtIdentity | AnonymousIdentity => ({
        token: zT
      }))
      .alt(
        maybeProfile.map(
          (mP: InitializedProfile): AnonymousIdentity => ({
            name: mP.name,
            email: mP.email
          })
        )
      )
      .getOrElse({});

    setUserIdentity(zendeskIdentity);
  }, [zendeskToken, profile]);

  const handleContactSupportPress = () => {
    if (isPanicModeActive(zendeskRemoteConfig)) {
      // Go to panic mode screen
      navigation.navigate(navigateToZendeskPanicMode());
    } else {
      navigation.navigate(
        navigateToZendeskAskPermissions({ assistanceForPayment })
      );
    }
  };

  return (
    <>
      <H3>{I18n.t("support.helpCenter.supportComponent.title")}</H3>
      <View spacer={true} />
      <H4 weight={"Regular"}>
        {I18n.t("support.helpCenter.supportComponent.subtitle")}
      </H4>
      <View spacer={true} large={true} />
      <AdviceComponent
        text={I18n.t("support.helpCenter.supportComponent.adviceMessage")}
      />
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
      <View spacer={true} />
      <ButtonDefaultOpacity
        onPress={() => {
          showSupportTickets();
          workUnitCompleted();
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
    </>
  );
};

export default ZendeskSupportComponent;
