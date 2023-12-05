import { fastLoginOptInActions } from "./optInActions";
import { SecurityAdviceActions } from "./securityAdviceActions";
import { FastLoginTokenRefreshActions } from "./tokenRefreshActions";

export type FastLoginActions =
  | fastLoginOptInActions
  | FastLoginTokenRefreshActions
  | SecurityAdviceActions;
