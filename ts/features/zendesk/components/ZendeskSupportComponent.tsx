import * as React from "react";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { View } from "native-base";
import { zendeskTokenSelector } from "../../../store/reducers/authentication";
import {
  initSupportAssistance,
  isPanicModeActive,
  showSupportTickets,
  ZendeskAppConfig,
  zendeskDefaultAnonymousConfig,
  zendeskDefaultJwtConfig
} from "../../../utils/supportAssistance";
import { profileSelector } from "../../../store/reducers/profile";
import { useIOSelector } from "../../../store/hooks";
import {
  navigateToZendeskAskPermissions,
  navigateToZendeskChooseCategory,
  navigateToZendeskPanicMode
} from "../store/actions/navigation";
import { useNavigationContext } from "../../../utils/hooks/useOnFocus";
import {
  zendeskRequestTicketNumber,
  zendeskSupportCompleted
} from "../store/actions";
import I18n from "../../../i18n";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import { Label } from "../../../components/core/typography/Label";
import AdviceComponent from "../../../components/AdviceComponent";
import { H4 } from "../../../components/core/typography/H4";
import {
  zendeskConfigSelector,
  zendeskTicketNumberSelector
} from "../store/reducers";
import { getValueOrElse, isReady } from "../../bonus/bpd/model/RemoteValue";
import { H3 } from "../../../components/core/typography/H3";
import { mixpanelTrack } from "../../../mixpanel";

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
  const ticketsNumber = useIOSelector(zendeskTicketNumberSelector);
  const workUnitCompleted = () => dispatch(zendeskSupportCompleted());
  const [zendeskConfig, setZendeskConfig] = React.useState<ZendeskAppConfig>(
    zendeskToken
      ? { ...zendeskDefaultJwtConfig, token: zendeskToken }
      : zendeskDefaultAnonymousConfig
  );

  useEffect(() => {
    setZendeskConfig(
      zendeskToken
        ? { ...zendeskDefaultJwtConfig, token: zendeskToken }
        : zendeskDefaultAnonymousConfig
    );
  }, [zendeskToken]);

  useEffect(() => {
    initSupportAssistance(zendeskConfig);

    // In Zendesk we have two configuration: JwtConfig and AnonymousConfig.
    // The AnonymousConfig is used both for the users authenticated with name and email and for the anonymous user.

    dispatch(zendeskRequestTicketNumber.request());
  }, [dispatch, zendeskConfig, zendeskToken, profile]);

  const handleContactSupportPress = () => {
    const canSkipCategoryChoice: boolean =
      !isReady(zendeskRemoteConfig) || assistanceForPayment;

    if (isPanicModeActive(zendeskRemoteConfig)) {
      // Go to panic mode screen
      navigation.navigate(navigateToZendeskPanicMode());
      return;
    }

    const navigationAction = canSkipCategoryChoice
      ? navigateToZendeskAskPermissions
      : navigateToZendeskChooseCategory;
    navigation.navigate(navigationAction({ assistanceForPayment }));
  };

  // If the user opened at least at ticket show the "Show tickets" button
  const showAlreadyOpenedTicketButton: boolean =
    getValueOrElse(ticketsNumber, 0) > 0;

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
      {showAlreadyOpenedTicketButton && (
        <>
          <ButtonDefaultOpacity
            onPress={() => {
              void mixpanelTrack("ZENDESK_SHOW_TICKETS");
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
          <View spacer={true} />
        </>
      )}
    </>
  );
};

export default ZendeskSupportComponent;
