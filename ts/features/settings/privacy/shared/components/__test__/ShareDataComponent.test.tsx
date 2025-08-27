import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import I18n from "i18next";
import { openWebUrl } from "../../../../../../utils/url";
import { ShareDataComponent } from "../ShareDataComponent";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import { GlobalState } from "../../../../../../store/reducers/types";
import { appReducer } from "../../../../../../store/reducers";
import { applicationChangeState } from "../../../../../../store/actions/application";

const mockPresentFn = jest.fn();
const mockTrackInfo = jest.fn();

jest.mock("../../../../../../utils/hooks/bottomSheet", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const react = require("react-native");

  return {
    __esModule: true,
    useIOBottomSheetModal: () => ({
      present: mockPresentFn,
      bottomSheet: react.View
    })
  };
});
jest.mock("../../../../../../utils/url");

describe("Test ShareDataComponent", () => {
  afterEach(jest.clearAllMocks);

  it("should be not null", () => {
    const component = renderComponent();

    expect(component).not.toBeNull();
  });
  it("should call useIOBottomSheet present function on press why Link", () => {
    const component = renderComponent();

    expect(component).not.toBeNull();
    const linkComponent = component.getByText(
      I18n.t("profile.main.privacy.shareData.screen.why.cta")
    );
    expect(linkComponent).not.toBeNull();
    fireEvent.press(linkComponent);
    expect(mockPresentFn).toHaveBeenCalled();
    expect(mockTrackInfo).toHaveBeenCalled();
  });
  it("should call useIOBottomSheet present function on press security Link", () => {
    const component = renderComponent();

    expect(component).not.toBeNull();
    const linkComponent = component.getByText(
      I18n.t("profile.main.privacy.shareData.screen.security.cta")
    );
    expect(linkComponent).not.toBeNull();
    fireEvent.press(linkComponent);
    expect(mockTrackInfo).toHaveBeenCalled();
  });
  it("should call openWebUrl on press gdpr Link", () => {
    const component = renderComponent();

    expect(component).not.toBeNull();
    const linkComponent = component.getByText(
      I18n.t("profile.main.privacy.shareData.screen.gdpr.cta")
    );
    expect(linkComponent).not.toBeNull();
    fireEvent.press(linkComponent);
    expect(openWebUrl).toHaveBeenCalled();
    expect(mockTrackInfo).toHaveBeenCalled();
  });
  it("should call openWebUrl on press additionalInformation Body", () => {
    const component = renderComponent();

    expect(component).not.toBeNull();
    const linkComponent = component.getByTestId("additionalInformation");
    expect(linkComponent).not.toBeNull();
    fireEvent.press(linkComponent);
    expect(openWebUrl).toHaveBeenCalled();
    expect(mockTrackInfo).toHaveBeenCalled();
  });
});

const globalState = appReducer(undefined, applicationChangeState("active"));
const renderComponent = () =>
  renderScreenWithNavigationStoreContext<GlobalState>(
    () => <ShareDataComponent trackAction={mockTrackInfo} />,
    "DUMMY",
    {},
    createStore(appReducer, globalState as any)
  );
