import { createStore } from "redux";
import { createActor } from "xstate";
import { IOStackNavigationProp } from "../../../../../../navigation/params/AppParamsList";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import * as itwLifecycleSelectors from "../../../../lifecycle/store/selectors";
import { ItwParamsList } from "../../../../navigation/ItwParamsList";
import { ITW_ROUTES } from "../../../../navigation/routes";
import { itwProximityMachine } from "../../../proximity/machine/machine";
import { ItwProximityMachineContext } from "../../../proximity/machine/provider";
import {
  ItwPresentationCredentialDetailNavigationParams,
  ItwPresentationCredentialDetailScreen
} from "../ItwPresentationCredentialDetailScreen";

describe("ItwPresentationCredentialDetailScreen", () => {
  it("it should render the generic error message when route params are invalid", () => {
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
});

const renderComponent = (
  routeParams: ItwPresentationCredentialDetailNavigationParams
) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const initialSnapshot = createActor(itwProximityMachine).getSnapshot();

  const snapshot: typeof initialSnapshot = {
    ...initialSnapshot,
    value: "Success"
  };

  const mockNavigation = new Proxy(
    {},
    {
      get: _ => jest.fn()
    }
  ) as unknown as IOStackNavigationProp<
    ItwParamsList,
    "ITW_PRESENTATION_CREDENTIAL_DETAIL"
  >;

  const route = {
    key: "ITW_PRESENTATION_CREDENTIAL_DETAIL",
    name: ITW_ROUTES.PRESENTATION.CREDENTIAL_DETAIL,
    params: routeParams
  };

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => (
      <ItwProximityMachineContext.Provider options={{ snapshot }}>
        <ItwPresentationCredentialDetailScreen
          navigation={mockNavigation}
          route={route}
        />
      </ItwProximityMachineContext.Provider>
    ),
    ITW_ROUTES.PRESENTATION.CREDENTIAL_DETAIL,
    routeParams ?? {},
    createStore(appReducer, initialState as any)
  );
};
