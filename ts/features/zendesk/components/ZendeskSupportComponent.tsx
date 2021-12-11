import * as React from "react";
import { useEffect } from "react";
import * as pot from "italia-ts-commons/lib/pot";
import { fromNullable, Option } from "fp-ts/lib/Option";
import { useDispatch } from "react-redux";
import { zendeskTokenSelector } from "../../../store/reducers/authentication";
import {
  AnonymousIdentity,
  initSupportAssistance,
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
import { navigateToZendeskAskPermissions } from "../store/actions/navigation";
import { useNavigationContext } from "../../../utils/hooks/useOnFocus";
import { zendeskSupportCompleted } from "../store/actions";
import I18n from "../../../i18n";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import { Label } from "../../../components/core/typography/Label";
import { H3, View } from "native-base";
import AdviceComponent from "../../../components/AdviceComponent";
import { H4 } from "../../../components/core/typography/H4";

const ZendeskSupportComponent = () => {
  const zendeskToken = useIOSelector(zendeskTokenSelector);
  const profile = useIOSelector(profileSelector);
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

  return (
    <>
      <H3>{I18n.t("instabug.contextualHelp.title1")}</H3>
      <View spacer={true} />
      <H4 weight={"Regular"}>
        {
          "Per richiedere assistenza o suggerire un miglioramento, scrivici: ti risponderemo il prima possibile."
        }
      </H4>
      <View spacer={true} large={true} />
      <AdviceComponent
        text={
          "Se il tuo problema riguarda il contenuto di un messaggio o il servizio di un Ente, contatta quest’ultimo. Troverai i riferimenti all’interno del messaggio o nella scheda del servizio in questione."
        }
      />
      <View spacer={true} />
      <ButtonDefaultOpacity
        style={{
          alignSelf: "stretch"
        }}
        onPress={() => navigation.navigate(navigateToZendeskAskPermissions())}
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
