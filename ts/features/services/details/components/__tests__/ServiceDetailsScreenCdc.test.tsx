import { Body } from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import _ from "lodash";
import { createStore } from "redux";
import { Config } from "../../../../../../definitions/content/Config";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { baseRawBackendStatus as backendStatus } from "../../../../../store/reducers/__mock__/backendStatus";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { ServiceDetailsScreenCdc } from "../ServiceDetailsScreenCdc";

const renderComponent = (state: GlobalState) => {
  const store = createStore(appReducer, state as any);

  return renderScreenWithNavigationStoreContext(
    () => (
      <ServiceDetailsScreenCdc>
        <Body>DUMMY</Body>
      </ServiceDetailsScreenCdc>
    ),
    "DUMMY",
    {},
    store
  );
};

describe("ServiceDetailsScreenCdc", () => {
  it("should match snapshot when service is not enabled", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));

    const state = _.merge(undefined, globalState, {
      remoteConfig: O.some({
        ...backendStatus.config,
        cdcV2: {
          ...backendStatus.config.cdcV2,
          min_app_version: {
            ios: "100.0.0",
            android: "100.0.0"
          }
        }
      } as Config)
    } as GlobalState);

    const component = renderComponent(state);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should match snapshot when service is active", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));

    const state = _.merge(undefined, globalState, {
      remoteConfig: O.some({
        ...backendStatus.config,
        cdcV2: {
          ...backendStatus.config.cdcV2,
          min_app_version: {
            ios: "0.0.0",
            android: "0.0.0"
          }
        }
      } as Config)
    } as GlobalState);

    const component = renderComponent(state);
    expect(component.toJSON()).toMatchSnapshot();
  });
});
