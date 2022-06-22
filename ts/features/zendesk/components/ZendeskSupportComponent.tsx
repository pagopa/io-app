import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { View } from "native-base";
import * as React from "react";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { InitializedProfile } from "../../../../definitions/backend/InitializedProfile";
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
import {
  zendeskRequestTicketNumber,
  zendeskSupportCompleted
} from "../store/actions";
import {
  zendeskConfigSelector,
  zendeskTicketNumberSelector
} from "../store/reducers";
import { isReady } from "../../bonus/bpd/model/RemoteValue";

type Props = {
  assistanceForPayment: boolean;
};

type DisplayedButtons = "None" | "OpenRequest" | "Both";

const getDisplayedButtons = (
  ticketsNumber: pot.Pot<number, Error>
): DisplayedButtons =>
  pot.fold(
    ticketsNumber,
    () => "None",
    () => "None",
    v => (v > 0 ? "Both" : "OpenRequest"),
    _ => "OpenRequest",
    v => (v > 0 ? "Both" : "OpenRequest"),
    v => (v > 0 ? "Both" : "None"),
    (_, v) => (v > 0 ? "Both" : "OpenRequest"),
    (v, _) => (v > 0 ? "Both" : "OpenRequest")
  );

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
    const maybeProfile: O.Option<InitializedProfile> = pot.toOption(profile);

    initSupportAssistance(zendeskConfig);

    // In Zendesk we have two configuration: JwtConfig and AnonymousConfig.
    // The AnonymousConfig is used both for the users authenticated with name and email and for the anonymous user.
    // Since the zendesk session token and the profile are provided by two different endpoint
    // we sequentially check both:
    // - if the zendeskToken is present the user will be authenticated via jwt
    // - if the zendeskToken is not present but there is the profile,
    //   the user will be authenticated, in anonymous mode, with the profile data (if available)
    // - as last nothing is available (the user is not authenticated in IO) the user will be totally anonymous also in Zendesk
    const zendeskIdentity = pipe(
      zendeskToken,
      O.fromNullable,
      O.map((zT: string): JwtIdentity | AnonymousIdentity => ({
        token: zT
      })),
      O.altW(() =>
        pipe(
          maybeProfile,
          O.map(
            (mP: InitializedProfile): AnonymousIdentity => ({
              name: mP.name,
              email: mP.email
            })
          )
        )
      ),
      O.getOrElse(() => ({}))
    );

    setUserIdentity(zendeskIdentity);

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

  const displayedButton: DisplayedButtons = getDisplayedButtons(ticketsNumber);

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

      {displayedButton === "Both" && (
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
      {displayedButton !== "None" && (
        <>
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
      )}
    </>
  );
};

export default ZendeskSupportComponent;
