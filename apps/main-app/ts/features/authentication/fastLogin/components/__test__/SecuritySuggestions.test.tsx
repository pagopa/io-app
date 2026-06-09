import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import I18n from "i18next";
import SecuritySuggestions from "../SecuritySuggestions";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { useIOSelector } from "../../../../../store/hooks";
import { openWebUrl } from "../../../../../utils/url";
import { applicationChangeState } from "../../../../../store/actions/application";

jest.mock("../../../../../utils/url", () => ({
  openWebUrl: jest.fn()
}));

jest.mock("../../../../../store/hooks", () => ({
  ...jest.requireActual("../../../../../store/hooks"),
  useIOSelector: jest.fn()
}));

jest.mock("../../../../whatsnew/analytics", () => ({
  trackWhatsNewScreen: jest.fn()
}));

describe("SecuritySuggestions", () => {
  const renderComponent = () => {
    const initialState = appReducer(
      undefined,
      applicationChangeState("active")
    );
    const store = createStore(appReducer, initialState as any);
    return renderScreenWithNavigationStoreContext(
      () => <SecuritySuggestions />,
      "DUMMY",
      {},
      store
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useIOSelector as jest.Mock).mockReturnValue({
      io_web: "https://io.italia.it"
    });
  });

  it("should call openWebUrl when 'logout' action is pressed", () => {
    const { getAllByText } = renderComponent();
    const buttons = getAllByText(
      I18n.t("authentication.security_suggestions.navigate_to_the_site")
    );

    fireEvent.press(buttons[0]);
    expect(openWebUrl).toHaveBeenCalledWith("https://io.italia.it");
  });

  it("should call openWebUrl when 'lock access' action is pressed", () => {
    const { getAllByText } = renderComponent();
    const buttons = getAllByText(
      I18n.t("authentication.security_suggestions.navigate_to_the_site")
    );

    fireEvent.press(buttons[1]);
    expect(openWebUrl).toHaveBeenCalledWith("https://io.italia.it");
  });
});
