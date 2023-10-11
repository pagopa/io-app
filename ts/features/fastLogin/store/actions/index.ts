import { fastLoginOptInActions } from "./optInActions";
import { FastLoginTokenRefreshActions } from "./tokenRefreshActions";

export type FastLoginActions =
  | fastLoginOptInActions
  | FastLoginTokenRefreshActions;
