import { getPeople, isMixpanelInstanceInitialized } from "../../../../mixpanel";
import { GlobalState } from "../../../../store/reducers/types";
import { buildItwBaseProperties } from "./basePropertyBuilder";
import { ITWBaseProperties } from "./propertyTypes";

export type ITWProfileProperties = ITWBaseProperties;

/**
 * Updates only ITW Profile properties.
 */
export const updateItwProfileProperties = (state: GlobalState) => {
  if (!isMixpanelInstanceInitialized()) {
    return;
  }

  const props = buildItwBaseProperties(state);
  console.log("Setting ITW profile properties:", props);
  getPeople()?.set(props);
};

export const forceUpdateItwProfileProperties = (
  partialProps: Partial<ITWProfileProperties>
) => {
  if (!isMixpanelInstanceInitialized()) {
    return;
  }

  console.log("Force setting ITW profile properties:", partialProps);
  getPeople()?.set(partialProps);
};
