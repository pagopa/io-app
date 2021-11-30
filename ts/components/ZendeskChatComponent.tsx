import * as React from "react";
import { connect } from "react-redux";
import { useEffect } from "react";
import * as pot from "italia-ts-commons/lib/pot";
import { fromNullable, Option } from "fp-ts/lib/Option";
import { GlobalState } from "../store/reducers/types";
import { isLoggedInWithSessionInfo } from "../store/reducers/authentication";
import { Dispatch } from "../store/actions/types";
import {
  AnonymousIdentity,
  initSupportAssistance,
  JwtIdentity,
  openSupportTicket,
  setUserIdentity,
  showSupportTickets,
  ZendeskConfig,
  zendeskDefaultAnonymousConfig,
  zendeskDefaultJwtConfig
} from "../utils/supportAssistance";
import { profileSelector } from "../store/reducers/profile";
import { InitializedProfile } from "../../definitions/backend/InitializedProfile";
import IconFont from "./ui/IconFont";
import { IOColors } from "./core/variables/IOColors";
import ButtonDefaultOpacity from "./ButtonDefaultOpacity";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const ZendeskChatComponent: React.FC<Props> = (props: Props) => {
  const { zendeskToken, profile } = props;
  const [zendeskConfig, setZendeskConfig] = React.useState<ZendeskConfig>(
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
      <ButtonDefaultOpacity
        onPress={() => openSupportTicket()}
        transparent={true}
        testID={"zendeskOpenTicketButton"}
      >
        <IconFont
          name="io-question"
          color={IOColors.red}
          testID={"zendeskOpenTicketIcon"}
        />
      </ButtonDefaultOpacity>
      <ButtonDefaultOpacity
        onPress={() => showSupportTickets()}
        transparent={true}
        testID={"zendeskShowTicketsButton"}
      >
        <IconFont
          name="io-chat"
          color={IOColors.red}
          testID={"zendeskShowTicketsIcon"}
        />
      </ButtonDefaultOpacity>
    </>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  zendeskToken: isLoggedInWithSessionInfo(state.authentication)
    ? (state.authentication.sessionInfo.zendeskToken as string)
    : undefined,
  profile: profileSelector(state)
});
const mapDispatchToProps = (_: Dispatch) => ({});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ZendeskChatComponent);
