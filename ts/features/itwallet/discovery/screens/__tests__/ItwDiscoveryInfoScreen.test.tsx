import configureMockStore from "redux-mock-store";
import { createActor } from "xstate";
import _ from "lodash";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import * as selectors from "../../../common/store/selectors/preferences";
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

  it("should match the snapshot when isL3 is truea and isNfcEnabled is true", () => {
    const component = renderComponent(true, true);
    expect(component).toMatchSnapshot();
  });

  it("should match the snapshot when isL3 is true, isNfcEnabled is false and itwIsWalletInstanceRemotelyActiveSelector is true", () => {
    jest
      .spyOn(selectors, "itwIsWalletInstanceRemotelyActiveSelector")
      .mockReturnValue(true);

    const component = renderComponent(true, false);
    expect(component).toMatchSnapshot();
  });

  it("should match the snapshot when isL3 is true, isNfcEnabled is false and itwIsWalletInstanceRemotelyActiveSelector is false", () => {
    jest
      .spyOn(selectors, "itwIsWalletInstanceRemotelyActiveSelector")
      .mockReturnValue(false);

    const component = renderComponent(true, false);
    expect(component).toMatchSnapshot();
  });
});

const renderComponent = (isL3: boolean, isNFCEnabled: boolean = false) => {
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
    const initialSnapshot = createActor(itwEidIssuanceMachine).getSnapshot();

    return (
      <ItwEidIssuanceMachineContext.Provider
        logic={logic}
        options={{
          snapshot: _.merge(initialSnapshot, {
            value: "Idle",
            context: {
              cieContext: {
                isNFCEnabled,
                isCIEAuthenticationSupported: true
              }
            }
          })
        }}
      >
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
