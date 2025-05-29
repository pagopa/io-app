import configureMockStore from "redux-mock-store";
import { createActor } from "xstate";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { itwEidIssuanceMachine } from "../../../machine/eid/machine";
import { ItwEidIssuanceMachineContext } from "../../../machine/provider";
import { ITW_ROUTES } from "../../../navigation/routes";
import {
  ItwL3IdentificationModeSelectionScreen,
  ItwL3IdentificationModeSelectionScreenProps
} from "../ItwL3IdentificationModeSelectionScreen.tsx";

jest.mock("../../../../../config", () => ({
  itwEnabled: true
}));

describe("ItwL3IdentificationModeSelectionScreen", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render the screen correctly", () => {
    const component = renderComponent();
    expect(component).toBeTruthy();
  });

  describe("L3IdentificationView (L3 enabled)", () => {
    it("should render L3 view with appropriate elements", () => {
      const component = renderComponent(true);

      expect(component.queryByTestId("l3-identification-view")).not.toBeNull();
      expect(component.queryByTestId("l3-primary-action")).not.toBeNull();
      expect(component.queryByTestId("l3-cie-pin-header")).not.toBeNull();
      expect(component.queryByTestId("l3-cie-id-header")).not.toBeNull();
      expect(component.queryByTestId("l3-cie-id-nav")).not.toBeNull();
      expect(component.queryByTestId("Spid")).toBeNull();
    });
  });
});

const renderComponent = (isL3FeaturesEnabled = true, eidReissuing = false) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(globalState);

  const WrappedComponent = (
    props: ItwL3IdentificationModeSelectionScreenProps
  ) => {
    const logic = itwEidIssuanceMachine.provide({
      actions: {
        onInit: jest.fn(),
        navigateToL3IdentificationScreen: () => undefined
      }
    });

    const initialSnapshot = createActor(itwEidIssuanceMachine).getSnapshot();
    const snapshot: typeof initialSnapshot = {
      ...initialSnapshot,
      value: { UserIdentification: "L3Identification" },
      context: {
        ...initialSnapshot.context,
        isL3FeaturesEnabled,
        cieContext: {
          isNFCEnabled: true,
          isCIEAuthenticationSupported: true
        }
      }
    };

    return (
      <ItwEidIssuanceMachineContext.Provider
        logic={logic}
        options={{ snapshot }}
      >
        <ItwL3IdentificationModeSelectionScreen {...props} />
      </ItwEidIssuanceMachineContext.Provider>
    );
  };

  return renderScreenWithNavigationStoreContext<GlobalState>(
    WrappedComponent,
    ITW_ROUTES.IDENTIFICATION.LEVEl_SELECTION.L3,
    { eidReissuing },
    store
  );
};
