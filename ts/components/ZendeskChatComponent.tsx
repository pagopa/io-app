import * as React from "react";
import ButtonDefaultOpacity from "./ButtonDefaultOpacity";
import ZendDesk from "io-react-native-zendesk";
import { GlobalState } from "../store/reducers/types";
import { isLoggedInWithSessionInfo } from "../store/reducers/authentication";
import { Dispatch } from "../store/actions/types";
import { connect } from "react-redux";
import { useEffect } from "react";
import IconFont from "./ui/IconFont";
import { IOColors } from "./core/variables/IOColors";
import {
  initZendesk,
  ZendeskConfig,
  zendeskDefaultAnonymousConfig,
  zendeskDefaultJwtConfig
} from "../utils/zendesk";
import { profileSelector } from "../store/reducers/profile";
import * as pot from "italia-ts-commons/lib/pot";
import { fromNullable, isSome, Option } from "fp-ts/lib/Option";
import { InitializedProfile } from "../../definitions/backend/InitializedProfile";

type Props = {} & ReturnType<typeof mapDispatchToProps> &
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
    initZendesk(zendeskConfig);

    const zendeskIdentity = fromNullable(zendeskToken)
      .map((zT: string): ZendDesk.JwtIdentity | ZendDesk.AnonymousIdentity => ({
        token: zT
      }))
      .alt(
        maybeProfile.map(
          (mP: InitializedProfile): ZendDesk.AnonymousIdentity => ({
            name: mP.name,
            email: mP.email
          })
        )
      )
      .getOrElse({});
    ZendDesk.setUserIdentity(zendeskIdentity);
  }, [zendeskToken, profile]);

  const startChat = () => {
    const maybeProfile: Option<InitializedProfile> = pot.toOption(profile);

    ZendDesk.startChat({
      botName: "IO BOT",
      name: isSome(maybeProfile) ? maybeProfile.value.name : undefined,
      email: isSome(maybeProfile) ? maybeProfile.value.email : undefined
    });
  };

  return (
    <ButtonDefaultOpacity onPress={startChat} transparent={true}>
      <IconFont name="io-chat" color={IOColors.red} />
    </ButtonDefaultOpacity>
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
