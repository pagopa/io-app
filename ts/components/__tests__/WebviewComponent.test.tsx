import { render } from "@testing-library/react-native";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import WebviewComponent from "../WebviewComponent";
import { appReducer } from "../../store/reducers";
import { applicationChangeState } from "../../store/actions/application";
import { GlobalState } from "../../store/reducers/types";

describe("WebviewComponent tests", () => {
  it("snapshot for component", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const enrichedState = {
      ...globalState,
      persistedPreferences: {
        ...globalState.persistedPreferences,
        isDesignSystemEnabled: false
      }
    };
    const mockStore = configureMockStore<GlobalState>();
    const store: ReturnType<typeof mockStore> = mockStore(enrichedState);
    const component = render(
      <Provider store={store}>
        <WebviewComponent source={{ uri: "https://google.com" }} />
      </Provider>
    );
    expect(component).toMatchSnapshot();
  });
});
