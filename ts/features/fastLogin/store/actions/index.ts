import { fastLoginOptInActions } from "./optInActions";
import { securityAdviceActions } from "./securityAdviceActions";
import { FastLoginTokenRefreshActions } from "./tokenRefreshActions";

export type FastLoginActions =
  | fastLoginOptInActions
  | FastLoginTokenRefreshActions
  | securityAdviceActions;
