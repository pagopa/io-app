import { getPeople, isMixpanelInstanceInitialized } from "../../../../mixpanel";
import { GlobalState } from "../../../../store/reducers/types";
import { buildItwBaseProperties } from "./basePropertyBuilder";
import { ItwBaseProperties } from "./propertyTypes";

export type ItwProfileProperties = ItwBaseProperties;

/**
 * Updates only ITW Profile properties.
 */
export const updateItwProfileProperties = (state: GlobalState) => {
  if (!isMixpanelInstanceInitialized()) {
    return;
  }

  const props = buildItwBaseProperties(state);

  getPeople()?.set(props);
};

export const forceUpdateItwProfileProperties = (
  partialProps: Partial<ItwProfileProperties>
) => {
  if (!isMixpanelInstanceInitialized()) {
    return;
  }

  getPeople()?.set(partialProps);
};
