import configureMockStore from "redux-mock-store";
import { createActor } from "xstate";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as remoteConfigSelectors from "../../../common/store/selectors/remoteConfig";
import { itwEidIssuanceMachine } from "../../../machine/eid/machine";
import { ItwEidIssuanceMachineContext } from "../../../machine/provider";
import { ITW_ROUTES } from "../../../navigation/routes";
import {
  ItwIdentificationModeSelectionScreen,
  ItwIdentificationModeSelectionScreenProps
} from "../ItwIdentificationModeSelectionScreen";

jest.mock("../../../../../config", () => ({
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

  describe("DefaultIdentificationView (L3 disabled)", () => {
    it("should show all authentication methods when none are disabled", () => {
      const component = renderComponent();

      expect(component.queryByTestId("Spid")).not.toBeNull();
      expect(component.queryByTestId("CiePin")).not.toBeNull();
      expect(component.queryByTestId("CieID")).not.toBeNull();
    });

    it("should not show CiePin method when it is disabled", () => {
      jest
        .spyOn(
          remoteConfigSelectors,
          "itwDisabledIdentificationMethodsSelector"
        )
        .mockReturnValue(["CiePin"]);

      const component = renderComponent();

      expect(component.queryByTestId("Spid")).not.toBeNull();
      expect(component.queryByTestId("CiePin")).toBeNull();
      expect(component.queryByTestId("CieID")).not.toBeNull();
    });

    it("should not show SPID method when it is disabled", () => {
      jest
        .spyOn(
          remoteConfigSelectors,
          "itwDisabledIdentificationMethodsSelector"
        )
        .mockReturnValue(["SPID"]);

      const component = renderComponent();

      expect(component.queryByTestId("Spid")).toBeNull();
      expect(component.queryByTestId("CiePin")).not.toBeNull();
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
      expect(component.queryByTestId("CiePin")).not.toBeNull();
      expect(component.queryByTestId("CieID")).toBeNull();
    });
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

const renderComponent = (isL3FeaturesEnabled = false, eidReissuing = false) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(globalState);

  const WrappedComponent = (
    props: ItwIdentificationModeSelectionScreenProps
  ) => {
    const logic = itwEidIssuanceMachine.provide({
      actions: {
        onInit: jest.fn(),
        navigateToIdentificationModeScreen: () => undefined
      }
    });

    const initialSnapshot = createActor(itwEidIssuanceMachine).getSnapshot();
    const snapshot: typeof initialSnapshot = {
      ...initialSnapshot,
      value: { UserIdentification: "ModeSelection" },
      context: {
        ...initialSnapshot.context,
        isL3FeaturesEnabled,
        cieContext: {
          isNFCEnabled: true,
          isCIEAuthenticationSupported: true,
          previousCiePreparationScreen: "PreparationCie"
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
