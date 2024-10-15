import {
  apiUrlPrefix,
  cieLoginFlowWithDevServerEnabled
} from "../../../config";
import { isDevEnv } from "../../../utils/environment";

export type SpidLevel = "SpidL2" | "SpidL3";

export const cieFlowForDevServerEnabled =
  isDevEnv && cieLoginFlowWithDevServerEnabled;

export const getCieIDLoginUri = (spidLevel: SpidLevel, isUat: boolean) =>
  `${apiUrlPrefix}/login?entityID=${
    isUat ? "xx_servizicie_coll" : "xx_servizicie"
  }&authLevel=${spidLevel}`;
