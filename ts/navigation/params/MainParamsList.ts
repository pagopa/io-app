import { NavigatorScreenParams } from "@react-navigation/native";
import ROUTES from "../routes";
import { MessagesParamsList } from "./MessagesParamsList";
import { ProfileParamsList } from "./ProfileParamsList";
import { ServicesParamsList } from "./ServicesParamsList";
import { WalletParamsList } from "./WalletParamsList";

export type MainParamsList = {
  [ROUTES.MESSAGES_NAVIGATOR]: NavigatorScreenParams<MessagesParamsList>;
  [ROUTES.WALLET_NAVIGATOR]: NavigatorScreenParams<WalletParamsList>;
  [ROUTES.SERVICES_NAVIGATOR]: NavigatorScreenParams<ServicesParamsList>;
  [ROUTES.PROFILE_NAVIGATOR]: NavigatorScreenParams<ProfileParamsList>;
};
