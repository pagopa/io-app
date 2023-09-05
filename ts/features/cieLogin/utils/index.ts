import { cieLoginFlowWithDevServerEnabled } from "../../../config";
import { isDevEnv } from "../../../utils/environment";

export const cieFlowForDevServerEnabled =
  isDevEnv && cieLoginFlowWithDevServerEnabled;
