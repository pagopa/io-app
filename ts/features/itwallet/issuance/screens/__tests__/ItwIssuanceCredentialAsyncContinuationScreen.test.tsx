import * as O from "fp-ts/lib/Option";
import configureMockStore from "redux-mock-store";
import { createSelector } from "reselect";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { StoredCredential } from "../../../common/utils/itwTypesUtils";
import * as itwCredentialSelectors from "../../../credentials/store/selectors";
import * as itwLifecycleSelectors from "../../../lifecycle/store/selectors";
import { ITW_ROUTES } from "../../../navigation/routes";
import {
  ItwIssuanceCredentialAsyncContinuationNavigationParams,
  ItwIssuanceCredentialAsyncContinuationScreen
} from "../ItwIssuanceCredentialAsyncContinuationScreen";

const mockStoredCredential: StoredCredential = {
  credentialType: "mDL",
  credentialId: "dc_sd_jwt_mDL",
  jwt: { expiration: "2100-01-01T00:00:00Z" },
  parsedCredential: {
    expiry_date: { value: "2100-01-01", name: "expiry_date" }
  },
  keyTag: "1",
  credential: "credential",
  format: "dc+sd-jwt",
  issuerConf: {} as StoredCredential["issuerConf"]
};

describe("ItwIssuanceCredentialAsyncContinuationScreen", () => {
  it("it should render the generic error message when route params are invalid", () => {
    const componentNoParams = renderComponent(undefined);
    expect(componentNoParams).toMatchSnapshot();

    const componentWrongParams = renderComponent({ credentialType: "invalid" });
    expect(componentWrongParams).toMatchSnapshot();
  });

  it("it should render the activate wallet screen", () => {
    jest
      .spyOn(itwLifecycleSelectors, "itwLifecycleIsValidSelector")
      .mockReturnValue(false);

    const component = renderComponent({ credentialType: "MDL" });
    expect(component).toMatchSnapshot();
  });

  it("it should render the document already present screen", () => {
    jest
      .spyOn(itwLifecycleSelectors, "itwLifecycleIsValidSelector")
      .mockReturnValue(true);

    jest
      .spyOn(itwCredentialSelectors, "itwCredentialSelector")
      .mockImplementation(() =>
        createSelector(
          () => ({}),
          () => O.some(mockStoredCredential)
        )
      );

    const component = renderComponent({ credentialType: "MDL" });
    expect(component).toMatchSnapshot();
  });
});

const renderComponent = (
  routeParams?: ItwIssuanceCredentialAsyncContinuationNavigationParams
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store = mockStore(globalState);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    ItwIssuanceCredentialAsyncContinuationScreen,
    ITW_ROUTES.LANDING.CREDENTIAL_ASYNC_FLOW_CONTINUATION,
    routeParams ?? {},
    store
  );
};
