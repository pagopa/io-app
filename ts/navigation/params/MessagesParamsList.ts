import { NavigatorScreenParams } from "@react-navigation/native";
import { EUCovidCertParamsList } from "../../features/euCovidCert/navigation/params";
import EUCOVIDCERT_ROUTES from "../../features/euCovidCert/navigation/routes";
import { PnParamsList } from "../../features/pn/navigation/params";
import PN_ROUTES from "../../features/pn/navigation/routes";
import { MessageDetailAttachmentNavigationParams } from "../../screens/messages/MessageAttachment";
import { MessageDetailScreenNavigationParams } from "../../screens/messages/MessageDetailScreen";
import { MessageRouterScreenNavigationParams } from "../../screens/messages/MessageRouterScreen";
import ROUTES from "../routes";

export type MessagesParamsList = {
  [ROUTES.MESSAGE_ROUTER]: MessageRouterScreenNavigationParams;
  [ROUTES.MESSAGE_DETAIL]: MessageDetailScreenNavigationParams;
  [ROUTES.MESSAGE_DETAIL_ATTACHMENT]: MessageDetailAttachmentNavigationParams;
  [EUCOVIDCERT_ROUTES.MAIN]: NavigatorScreenParams<EUCovidCertParamsList>;
  [PN_ROUTES.MAIN]: NavigatorScreenParams<PnParamsList>;
};
