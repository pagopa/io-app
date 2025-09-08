import { fireEvent, render, userEvent } from "@testing-library/react-native";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import I18n from "i18next";
import { applicationChangeState } from "../../store/actions/application";
import { appReducer } from "../../store/reducers";
import { GlobalState } from "../../store/reducers/types";
import WebviewComponent from "../WebviewComponent";
describe("WebviewComponent tests", () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(globalState);

  it("snapshot for component", () => {
    const enrichedState = {
      ...globalState,
      persistedPreferences: {
        ...globalState.persistedPreferences,
        isDesignSystemEnabled: false
      }
    };
    const enrichedStore: ReturnType<typeof mockStore> =
      mockStore(enrichedState);
    const component = render(
      <Provider store={enrichedStore}>
        <WebviewComponent source={{ uri: "https://google.com" }} />
      </Provider>
    );
    expect(component).toMatchSnapshot();
  });

  it("should display error screen on error", () => {
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <WebviewComponent source={{ uri: "https://google.com" }} />
      </Provider>
    );

    fireEvent(getByTestId("webview"), "onError", {
      nativeEvent: { description: "Network error" }
    });

    expect(getByText(I18n.t("wallet.errors.GENERIC_ERROR"))).toBeTruthy();
    expect(getByText(I18n.t("global.buttons.retry"))).toBeTruthy();
  });

  it("should reload on retry", async () => {
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <WebviewComponent source={{ uri: "https://google.com" }} />
      </Provider>
    );

    fireEvent(getByTestId("webview"), "onError", {
      nativeEvent: { description: "Network error" }
    });
    userEvent.setup();
    await userEvent.press(getByText(I18n.t("global.buttons.retry")));

    expect(getByTestId("webview")).toBeTruthy();
  });

  it("should call handleError on WebView error", () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <WebviewComponent source={{ uri: "wrong uri" }} />
      </Provider>
    );

    fireEvent(getByTestId("webview"), "onError", {
      nativeEvent: { description: "Network error" }
    });

    expect(getByTestId("webview-error")).toBeTruthy();
  });
});
