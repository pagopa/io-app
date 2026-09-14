import { fastLoginOptInActions } from "./optInActions";
import { SecurityAdviceActions } from "./securityAdviceActions";
import { automaticSessionRefreshActions } from "./sessionRefreshActions";
import { FastLoginTokenRefreshActions } from "./tokenRefreshActions";

export type FastLoginActions =
  | automaticSessionRefreshActions
  | fastLoginOptInActions
  | FastLoginTokenRefreshActions
  | SecurityAdviceActions;
