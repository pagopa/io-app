import configureMockStore from "redux-mock-store";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import * as itwLifecycleSelectors from "../../../lifecycle/store/selectors";
import * as itwIdentificationSelectors from "../../../identification/store/selectors";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { itwEidIssuanceMachine } from "../../../machine/eid/machine";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import { ITW_ROUTES } from "../../../navigation/routes";
import {
  ItwDiscoveryInfoScreen,
  ItwDiscoveryInfoScreenProps
} from "../ItwDiscoveryInfoScreen";

describe("ItwDiscoveryInfoScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should match the snapshot when isL3 is false", () => {
    const component = renderComponent(false);
    expect(component).toMatchSnapshot();
  });

  it("should match the snapshot when isL3 is true and hasNfcFeature is true", () => {
    jest
      .spyOn(itwIdentificationSelectors, "itwHasNfcFeatureSelector")
      .mockReturnValue(true);

    const component = renderComponent(true);
    expect(component).toMatchSnapshot();
  });

  it("should match the snapshot when isL3 is true, hasNfcFeature is false and itwLifecycleIsValidSelector is true", () => {
    jest
      .spyOn(itwIdentificationSelectors, "itwHasNfcFeatureSelector")
      .mockReturnValue(false);
    jest
      .spyOn(itwLifecycleSelectors, "itwLifecycleIsValidSelector")
      .mockReturnValue(true);

    const component = renderComponent(true);
    expect(component).toMatchSnapshot();
  });

  it("should match the snapshot when isL3 is true, hasNfcFeature is false and itwLifecycleIsValidSelector is false", () => {
    jest
      .spyOn(itwIdentificationSelectors, "itwHasNfcFeatureSelector")
      .mockReturnValue(false);
    jest
      .spyOn(itwLifecycleSelectors, "itwLifecycleIsValidSelector")
      .mockReturnValue(false);

    const component = renderComponent(true);
    expect(component).toMatchSnapshot();
  });
});

const renderComponent = (isL3: boolean) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(globalState);

  const WrappedComponent = (props: ItwDiscoveryInfoScreenProps) => {
    const logic = itwEidIssuanceMachine.provide({
      actions: {
        onInit: jest.fn(),
        navigateToTosScreen: () => undefined
      }
    });

    return (
      <ItwEidIssuanceMachineContext.Provider logic={logic}>
        <ItwDiscoveryInfoScreen {...props} />
      </ItwEidIssuanceMachineContext.Provider>
    );
  };

  return renderScreenWithNavigationStoreContext<GlobalState>(
    WrappedComponent,
    ITW_ROUTES.DISCOVERY.INFO,
    { isL3 },
    store
  );
};
