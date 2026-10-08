import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import { Alert, BackHandler } from "react-native";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import { selectCanGoBackToL3Identification } from "../../../machine/eid/selectors";
import { ITW_ROUTES } from "../../../navigation/routes";
import { ItwDiscoveryInfoFallbackComponent } from "../ItwDiscoveryInfoFallbackComponent";

describe("ItwDiscoveryInfoFallbackComponent", () => {
  const spyEidUseActorRef = jest.spyOn(
    ItwEidIssuanceMachineContext,
    "useActorRef"
  );
  const spyEidUseSelector = jest.spyOn(
    ItwEidIssuanceMachineContext,
    "useSelector"
  );
  const spyAlert = jest.spyOn(Alert, "alert").mockImplementation(jest.fn());
  const spyAddBackListener = jest.spyOn(BackHandler, "addEventListener");
  const mockSend = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    spyEidUseActorRef.mockReturnValue({ send: mockSend } as any);
  });

  const mockCanGoBackToL3Identification = (canGoBack: boolean) =>
    spyEidUseSelector.mockImplementation(((selector: unknown) =>
      selector === selectCanGoBackToL3Identification
        ? canGoBack
        : false) as any);

  // Mimics BackHandler: listeners run from the most recent one until one of
  // them consumes the event by returning `true`.
  const pressHardwareBack = () =>
    spyAddBackListener.mock.calls
      .filter(([eventName]) => eventName === "hardwareBackPress")
      .map(([, handler]) => handler)
      .reverse()
      .some(handler => handler() === true);

  const pressHeaderBack = (component: ReturnType<typeof renderComponent>) =>
    component
      .getAllByLabelText(I18n.t("global.buttons.back"))
      .forEach(fireEvent.press);

  describe("when reached from the L3 identification", () => {
    beforeEach(() => mockCanGoBackToL3Identification(true));

    it("goes back to the L3 identification from the header", () => {
      pressHeaderBack(renderComponent());

      expect(mockSend).toHaveBeenCalledWith({
        type: "back-to-l3-identification"
      });
      expect(spyAlert).not.toHaveBeenCalled();
    });

    it("goes back to the L3 identification with the hardware back button", () => {
      renderComponent();

      expect(pressHardwareBack()).toBe(true);
      expect(mockSend).toHaveBeenCalledWith({
        type: "back-to-l3-identification"
      });
      expect(spyAlert).not.toHaveBeenCalled();
    });
  });

  describe("when not reached from the L3 identification", () => {
    beforeEach(() => mockCanGoBackToL3Identification(false));

    it("asks for confirmation from the header", () => {
      pressHeaderBack(renderComponent());

      expect(spyAlert).toHaveBeenCalledWith(
        I18n.t("features.itWallet.discovery.screen.diw.dismissalDialog.title"),
        I18n.t("features.itWallet.discovery.screen.diw.dismissalDialog.body"),
        expect.any(Array)
      );
      expect(mockSend).not.toHaveBeenCalledWith({
        type: "back-to-l3-identification"
      });
    });

    it("asks for confirmation with the hardware back button", () => {
      renderComponent();

      expect(pressHardwareBack()).toBe(true);
      expect(spyAlert).toHaveBeenCalledTimes(1);
      expect(mockSend).not.toHaveBeenCalledWith({
        type: "back-to-l3-identification"
      });
    });
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    ItwDiscoveryInfoFallbackComponent,
    ITW_ROUTES.DISCOVERY.INFO,
    {},
    store
  );
};
