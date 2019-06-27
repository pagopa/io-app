import { createSelector } from "reselect";
import { isDefined } from "../../../../utils/guards";
import { GlobalState } from "../../types";

const servicesSelector = (state: GlobalState) => state.entities.services;
const organizationsSelector = (state: GlobalState) =>
  state.entities.organizations;

export const getAllSections = createSelector(
  [servicesSelector, organizationsSelector],
  (services, organizations) => {
    const orgfiscalCodes = Object.keys(services.byOrgFiscalCode);
    return orgfiscalCodes
      .map(fiscalCode => {
        const title = organizations[fiscalCode] || fiscalCode;
        const serviceIdsForOrg = services.byOrgFiscalCode[fiscalCode] || [];
        const data = serviceIdsForOrg
          .map(id => services.byId[id])
          .filter(isDefined);
        return {
          title,
          data
        };
      })
      .sort((a, b) => (a.title || "").localeCompare(b.title))
      .filter(_ => _.data.length > 0);
  }
);
