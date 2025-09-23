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
  ItwL2IdentificationModeSelectionScreen,
  ItwL2IdentificationModeSelectionScreenProps
} from "../../../common/screens/ItwL2IdentificationModeSelectionScreen";

jest.mock("../../../../../../config", () => ({
  itwEnabled: true
}));

describe("ItwL2IdentificationModeSelectionScreen", () => {
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
    });

    it("should show all authentication methods in reissuing", () => {
      const component = renderComponent(false, true);

      expect(component.queryByTestId("CieID")).not.toBeNull();
      expect(component.queryByTestId("Spid")).not.toBeNull();
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
    props: ItwL2IdentificationModeSelectionScreenProps
  ) => {
    const logic = itwEidIssuanceMachine.provide({
      actions: {
        onInit: jest.fn(),
        navigateToL2IdentificationScreen: () => undefined
      }
    });

    const initialSnapshot = createActor(itwEidIssuanceMachine).getSnapshot();
    const snapshot: typeof initialSnapshot = {
      ...initialSnapshot,
      value: { UserIdentification: { Identification: "L2" } },
      context: {
        ...initialSnapshot.context,
        isL3,
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
        <ItwL2IdentificationModeSelectionScreen {...props} />
      </ItwEidIssuanceMachineContext.Provider>
    );
  };

  return renderScreenWithNavigationStoreContext<GlobalState>(
    WrappedComponent,
    ITW_ROUTES.IDENTIFICATION.MODE_SELECTION.L2,
    { eidReissuing },
    store
  );
};
