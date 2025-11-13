import configureMockStore from "redux-mock-store";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as identificationSelectors from "../../../identification/common/store/selectors";
import { EidIssuanceLevel } from "../../../machine/eid/context";
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

  test.each(["l3", "l3-next"] as const)(
    "should render ItwDiscoveryInfoComponent for level %s",
    level => {
      jest
        .spyOn(identificationSelectors, "itwHasNfcFeatureSelector")
        .mockReturnValue(true);
      const { getByTestId } = renderComponent(level);
      expect(getByTestId("itwDiscoveryInfoComponentTestID")).toBeTruthy();
    }
  );

  test.each(["l3", "l3-next"] as const)(
    "should render ItwNfcNotSupportedComponent for level %s when NFC is not supported",
    level => {
      jest
        .spyOn(identificationSelectors, "itwHasNfcFeatureSelector")
        .mockReturnValue(false);
      const { getByTestId } = renderComponent(level);
      expect(getByTestId("itwNfcNotSupportedComponentTestID")).toBeTruthy();
    }
  );

  it("should render ItwDiscoveryInfoFallbackComponent for level l2-fallback", () => {
    const { getByTestId } = renderComponent("l2-fallback");
    expect(getByTestId("itwDiscoveryInfoFallbackComponentTestID")).toBeTruthy();
  });

  test.each([undefined, "l2"] as const)(
    "should render ItwDiscoveryInfoLegacyComponent for level %s",
    level => {
      const { getByTestId } = renderComponent(level);
      expect(getByTestId("itwDiscoveryInfoLegacyComponentTestID")).toBeTruthy();
    }
  );
});

const renderComponent = (level: EidIssuanceLevel | undefined) => {
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
    { level },
    store
  );
};
