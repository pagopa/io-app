import { useNavigation } from "@react-navigation/native";
import { View } from "native-base";
import * as React from "react";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import AdviceComponent from "../../../components/AdviceComponent";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import { H3 } from "../../../components/core/typography/H3";
import { H4 } from "../../../components/core/typography/H4";
import { Label } from "../../../components/core/typography/Label";
import I18n from "../../../i18n";
import { mixpanelTrack } from "../../../mixpanel";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../store/hooks";
import { zendeskTokenSelector } from "../../../store/reducers/authentication";
import { profileSelector } from "../../../store/reducers/profile";
import {
  initSupportAssistance,
  isPanicModeActive,
  showSupportTickets,
  ZendeskAppConfig,
  zendeskDefaultAnonymousConfig,
  zendeskDefaultJwtConfig
} from "../../../utils/supportAssistance";
import { getValueOrElse, isReady } from "../../bonus/bpd/model/RemoteValue";
import {
  zendeskRequestTicketNumber,
  zendeskSupportCompleted
} from "../store/actions";
import {
  zendeskConfigSelector,
  zendeskTicketNumberSelector
} from "../store/reducers";

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
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
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
      navigation.navigate("ZENDESK_MAIN", {
        screen: "ZENDESK_PANIC_MODE"
      });
      return;
    }

    if (canSkipCategoryChoice) {
      navigation.navigate("ZENDESK_MAIN", {
        screen: "ZENDESK_ASK_PERMISSIONS",
        params: { assistanceForPayment }
      });
    } else {
      navigation.navigate("ZENDESK_MAIN", {
        screen: "ZENDESK_CHOOSE_CATEGORY",
        params: { assistanceForPayment }
      });
    }
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
