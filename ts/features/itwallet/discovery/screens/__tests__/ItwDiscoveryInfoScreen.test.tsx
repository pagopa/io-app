import configureMockStore from "redux-mock-store";
import { Action } from "redux";
import { reproduceSequence } from "../../../../../utils/tests";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { itwHasNfcFeature } from "../../../identification/store/actions";
import { itwSetWalletInstanceRemotelyActive } from "../../../common/store/actions/preferences";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { itwEidIssuanceMachine } from "../../../machine/eid/machine";
import { ItwEidIssuanceMachineContext } from "../../../machine/provider";
import { ITW_ROUTES } from "../../../navigation/routes";
import {
  ItwDiscoveryInfoScreen,
  ItwDiscoveryInfoScreenProps
} from "../ItwDiscoveryInfoScreen";

describe("ItwDiscoveryInfoScreen", () => {
  it("should match the snapshot when isL3 is false", () => {
    const component = renderComponent(false);
    expect(component).toMatchSnapshot();
  });

  it("should match the snapshot when isL3 is true and hasNfcFeature is true", () => {
    const component = renderComponent(true, true);
    expect(component).toMatchSnapshot();
  });

  it("should match the snapshot when isL3 is true, hasNfcFeature is false and itwIsWalletInstanceRemotelyActiveSelector is true", () => {
    const component = renderComponent(true, false, true);
    expect(component).toMatchSnapshot();
  });

  it("should match the snapshot when isL3 is true, hasNfcFeature is false and itwIsWalletInstanceRemotelyActiveSelector is false", () => {
    const component = renderComponent(true, false, false);
    expect(component).toMatchSnapshot();
  });
});

const renderComponent = (
  isL3: boolean,
  hasNfc: boolean = false,
  isWalletInstanceRemotelyActive: boolean = false
) => {
  const sequenceOfActions: ReadonlyArray<Action> = [
    applicationChangeState("active"),
    itwHasNfcFeature.success(hasNfc),
    itwSetWalletInstanceRemotelyActive(isWalletInstanceRemotelyActive)
  ];

  const globalState: GlobalState = reproduceSequence(
    {} as GlobalState,
    appReducer,
    sequenceOfActions
  );

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
