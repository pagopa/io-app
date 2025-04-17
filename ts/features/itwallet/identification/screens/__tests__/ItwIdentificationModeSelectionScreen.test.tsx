import configureMockStore from "redux-mock-store";
import { IOStackNavigationProp } from "../../../../../navigation/params/AppParamsList";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as remoteConfigSelectors from "../../../common/store/selectors/remoteConfig";
import * as preferencesSelectors from "../../../common/store/selectors/preferences";
import { itwEidIssuanceMachine } from "../../../machine/eid/machine";
import { ItwEidIssuanceMachineContext } from "../../../machine/provider";
import { ItwParamsList } from "../../../navigation/ItwParamsList";
import { ITW_ROUTES } from "../../../navigation/routes";
import { ItwIdentificationModeSelectionScreen } from "../ItwIdentificationModeSelectionScreen";

jest.mock("../../../../../config", () => ({
  itwEnabled: true
}));

jest.mock("../../../machine/eid/selectors", () => ({
  isCIEAuthenticationSupportedSelector: () => true
}));

describe("ItwIdentificationModeSelectionScreen", () => {
  beforeEach(() => {
    // Default mock for L3 disabled
    jest
      .spyOn(preferencesSelectors, "itwIsL3EnabledSelector")
      .mockReturnValue(false);

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
    beforeEach(() => {
      jest
        .spyOn(preferencesSelectors, "itwIsL3EnabledSelector")
        .mockReturnValue(false);
    });

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
    beforeEach(() => {
      jest
        .spyOn(preferencesSelectors, "itwIsL3EnabledSelector")
        .mockReturnValue(true);
    });

    it("should render L3 view with appropriate elements", () => {
      const component = renderComponent();

      expect(component.queryByTestId("l3-identification-view")).not.toBeNull();
      expect(component.queryByTestId("l3-primary-action")).not.toBeNull();
      expect(component.queryByTestId("l3-cie-pin-header")).not.toBeNull();
      expect(component.queryByTestId("l3-cie-id-header")).not.toBeNull();
      expect(component.queryByTestId("l3-cie-id-nav")).not.toBeNull();
      expect(component.queryByTestId("Spid")).toBeNull();
    });
  });

  const renderComponent = (eidReissuing = false) => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const mockStore = configureMockStore<GlobalState>();
    const store: ReturnType<typeof mockStore> = mockStore(globalState);

    const logic = itwEidIssuanceMachine.provide({
      actions: {
        onInit: jest.fn()
      }
    });

    const mockNavigation = new Proxy(
      {},
      {
        get: () => jest.fn()
      }
    ) as unknown as IOStackNavigationProp<
      ItwParamsList,
      "ITW_IDENTIFICATION_MODE_SELECTION"
    >;

    const route = {
      key: "ITW_IDENTIFICATION_MODE_SELECTION",
      name: ITW_ROUTES.IDENTIFICATION.MODE_SELECTION,
      params: { eidReissuing }
    };

    return renderScreenWithNavigationStoreContext<GlobalState>(
      () => (
        <ItwEidIssuanceMachineContext.Provider logic={logic}>
          <ItwIdentificationModeSelectionScreen
            navigation={mockNavigation}
            route={route}
          />
        </ItwEidIssuanceMachineContext.Provider>
      ),
      ITW_ROUTES.IDENTIFICATION.MODE_SELECTION,
      {},
      store
    );
  };
});
