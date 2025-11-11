import configureMockStore from "redux-mock-store";
import { createActor } from "xstate";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import * as remoteConfigSelectors from "../../../../common/store/selectors/remoteConfig";
import { itwEidIssuanceMachine } from "../../../../machine/eid/machine";
import { ItwEidIssuanceMachineContext } from "../../../../machine/eid/provider";
import { ITW_ROUTES } from "../../../../navigation/routes";
import {
  ItwIdentificationModeSelectionScreen,
  ItwIdentificationModeSelectionScreenProps
} from "../ItwIdentificationModeSelectionScreen.tsx";

jest.mock("../../../../../../config", () => ({
  itwEnabled: true
}));

describe("ItwIdentificationModeSelectionScreen", () => {
  beforeEach(() => {
    // Default mock for no disabled methods
    jest
      .spyOn(remoteConfigSelectors, "itwDisabledIdentificationMethodsSelector")
      .mockReturnValue([]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render the screen correctly", () => {
    const component = renderComponent();
    expect(component).toBeTruthy();
  });

  describe("L2IdentificationView (L3 disabled)", () => {
    it("should show all authentication methods in L2", () => {
      const component = renderComponent();

      expect(component.queryByTestId("CieID")).not.toBeNull();
      expect(component.queryByTestId("Spid")).not.toBeNull();
      expect(component.queryByTestId("CiePin")).not.toBeNull();
      expect(component.queryByTestId("noCieButton")).toBeNull();
    });

    it("should show all authentication methods in reissuing", () => {
      const component = renderComponent(false, true);

      expect(component.queryByTestId("CieID")).not.toBeNull();
      expect(component.queryByTestId("Spid")).not.toBeNull();
      expect(component.queryByTestId("CiePin")).not.toBeNull();
      expect(component.queryByTestId("noCieButton")).toBeNull();
    });

    it("should show all authentication methods in L3 except for SPID", () => {
      const component = renderComponent(true, false);

      expect(component.queryByTestId("CieID")).not.toBeNull();
      expect(component.queryByTestId("Spid")).toBeNull();
      expect(component.queryByTestId("CiePin")).not.toBeNull();
      expect(component.queryByTestId("noCieButton")).not.toBeNull();
    });

    it("should show all authentication and no noCieButton methods in L3 reissuing mode except for SPID", () => {
      const component = renderComponent(true, true);

      expect(component.queryByTestId("noCieButton")).toBeNull();
      expect(component.queryByTestId("CieID")).not.toBeNull();
      expect(component.queryByTestId("Spid")).toBeNull();
      expect(component.queryByTestId("CiePin")).not.toBeNull();
    });

    it("should not show SPID method when it is disabled", () => {
      jest
        .spyOn(
          remoteConfigSelectors,
          "itwDisabledIdentificationMethodsSelector"
        )
        .mockReturnValue(["SPID"]);

      const component = renderComponent();

      expect(component.queryByTestId("CieID")).not.toBeNull();
    });

    it("should not show CieId method when it is disabled", () => {
      jest
        .spyOn(
          remoteConfigSelectors,
          "itwDisabledIdentificationMethodsSelector"
        )
        .mockReturnValue(["CieID"]);

      const component = renderComponent();

      expect(component.queryByTestId("Spid")).not.toBeNull();
      expect(component.queryByTestId("CieID")).toBeNull();
    });
  });
});

const renderComponent = (isL3 = false, eidReissuing = false) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(globalState);

  const WrappedComponent = (
    props: ItwIdentificationModeSelectionScreenProps
  ) => {
    const logic = itwEidIssuanceMachine.provide({
      actions: {
        onInit: jest.fn(),
        navigateToIdentificationScreen: () => undefined
      }
    });

    const initialSnapshot = createActor(itwEidIssuanceMachine).getSnapshot();
    const snapshot: typeof initialSnapshot = {
      ...initialSnapshot,
      value: { UserIdentification: { Identification: isL3 ? "L3" : "L2" } },
      context: {
        ...initialSnapshot.context,
        level: isL3 ? "l3" : "l2",
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
        <ItwIdentificationModeSelectionScreen {...props} />
      </ItwEidIssuanceMachineContext.Provider>
    );
  };

  return renderScreenWithNavigationStoreContext<GlobalState>(
    WrappedComponent,
    ITW_ROUTES.IDENTIFICATION.MODE_SELECTION,
    { eidReissuing },
    store
  );
};
