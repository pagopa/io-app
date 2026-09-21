import { fireEvent, render, renderHook } from "@testing-library/react-native";
import I18n from "i18next";
import { Provider } from "react-redux";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import * as bottomSheetUtils from "../../../../../../utils/hooks/bottomSheet";
import * as urlUtils from "../../../../../../utils/url";
import * as cieAnalytics from "../../../../common/analytics/cieAnalytics";
import { useCieInfoBottomSheet } from "../useCieInfoBottomSheet";

const mockPresent = jest.fn();
const mockDismiss = jest.fn();

jest.mock("../../../../../../utils/hooks/bottomSheet", () => ({
  useIOBottomSheetModal: jest.fn()
}));

const createTestStore = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  return createStore(appReducer, initialState as any);
};

const renderUseCieInfoBottomSheet = (store = createTestStore()) =>
  renderHook(() => useCieInfoBottomSheet(), {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
  });

describe("useCieInfoBottomSheet", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(bottomSheetUtils, "useIOBottomSheetModal").mockImplementation(
      ({ component }) =>
        ({
          bottomSheet: component,
          dismiss: mockDismiss,
          present: mockPresent
        }) as ReturnType<typeof bottomSheetUtils.useIOBottomSheetModal>
    );
  });

  it("should return present, dismiss and bottomSheet", () => {
    const { result } = renderUseCieInfoBottomSheet();

    expect(result.current.dismiss).toBe(mockDismiss);
    expect(result.current.bottomSheet).toBeTruthy();
    expect(typeof result.current.present).toBe("function");
  });

  it("should track the info event (with the current login flow) and present the bottom sheet when present() is called", () => {
    const trackSpy = jest.spyOn(cieAnalytics, "trackLoginCiePinInfo");
    const { result } = renderUseCieInfoBottomSheet();

    result.current.present();

    expect(trackSpy).toHaveBeenCalledWith("auth");
    expect(mockPresent).toHaveBeenCalled();
  });

  it("should render the bottom sheet content with the CTA that opens the pin/puk help page", () => {
    const openWebUrlSpy = jest
      .spyOn(urlUtils, "openWebUrl")
      .mockImplementation(() => undefined);
    const { result } = renderUseCieInfoBottomSheet();

    const { getByText } = render(result.current.bottomSheet);

    const cta = getByText(I18n.t("authentication.cie.pin.bottomSheetCTA"));
    expect(cta).toBeTruthy();

    fireEvent.press(cta);

    expect(openWebUrlSpy).toHaveBeenCalledTimes(1);
  });
});
