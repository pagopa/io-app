import { ioDevServerConfig } from "../../../config";
import { IoDevServerConfig } from "../../../types/config";
import { FIMSConfig } from "../types/config";

export const getFimsConfig = (
  config: IoDevServerConfig = ioDevServerConfig
): FIMSConfig => config.features.fims;
