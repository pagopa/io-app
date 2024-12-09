import { createStore } from "redux";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { GlobalState } from "../../../../../store/reducers/types";
import { ITW_ROUTES } from "../../../navigation/routes";
import {
  ItwIssuanceCredentialNotFoundNavigationParams,
  ItwIssuanceCredentialNotFoundScreen
} from "../ItwIssuanceCredentialNotFoundScreen";

jest.mock("../../../machine/provider", () => ({
  ItwCredentialIssuanceMachineContext: {
    useActorRef: jest.fn(() => ({
      send: jest.fn()
    }))
  }
}));

describe("ItwIssuanceCredentialNotFoundScreen", () => {
  it("it should render the generic error message when route params are invalid", () => {
    const componentNoParams = renderComponent(undefined);
    expect(componentNoParams).toMatchSnapshot();

    const componentWrongParams = renderComponent({ credentialType: "invalid" });
    expect(componentWrongParams).toMatchSnapshot();
  });

  it("it should render the screen with a button to start the document activation flow", () => {
    const component = renderComponent({ credentialType: "MDL" });
    expect(component).toMatchSnapshot();
  });
});

const renderComponent = (
  routeParams?: ItwIssuanceCredentialNotFoundNavigationParams
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    ItwIssuanceCredentialNotFoundScreen,
    ITW_ROUTES.ISSUANCE.CREDENTIAL_NOT_FOUND,
    routeParams ?? {},
    store
  );
};
