import { fastLoginOptInActions } from "./optInActions";
import { SecurityAdviceActions } from "./securityAdviceActions";
import { fastLoginSessionRefreshActions } from "./sessionRefreshActions";
import { FastLoginTokenRefreshActions } from "./tokenRefreshActions";

export type FastLoginActions =
  | fastLoginOptInActions
  | fastLoginSessionRefreshActions
  | FastLoginTokenRefreshActions
  | SecurityAdviceActions;
