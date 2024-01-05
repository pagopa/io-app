import { NavigatorScreenParams } from "@react-navigation/native";
import EUCOVIDCERT_ROUTES from "../../euCovidCert/navigation/routes";
import PN_ROUTES from "../../pn/navigation/routes";
import { MessageRouterScreenNavigationParams } from "../screens/MessageRouterScreen";
import { MessageDetailScreenNavigationParams } from "../screens/MessageDetailScreen";
import { MessageDetailAttachmentNavigationParams } from "../screens/MessageAttachment";
import { EUCovidCertParamsList } from "../../euCovidCert/navigation/params";
import { PnParamsList } from "../../pn/navigation/params";
import { MESSAGES_ROUTES } from "./routes";

export type MessagesParamsList = {
  [MESSAGES_ROUTES.MESSAGE_ROUTER]: MessageRouterScreenNavigationParams;
  [MESSAGES_ROUTES.MESSAGE_DETAIL]: MessageDetailScreenNavigationParams;
  [MESSAGES_ROUTES.MESSAGE_DETAIL_ATTACHMENT]: MessageDetailAttachmentNavigationParams;
  [EUCOVIDCERT_ROUTES.MAIN]: NavigatorScreenParams<EUCovidCertParamsList>;
  [PN_ROUTES.MAIN]: NavigatorScreenParams<PnParamsList>;
};
