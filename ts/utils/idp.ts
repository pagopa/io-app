import * as config from "../config";

export const getIdpLoginUri = (idpId: string) =>
  `${config.apiUrlPrefix}/login?authLevel=SpidL2&entityID=${idpId}`;
