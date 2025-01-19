import { render } from "@testing-library/react-native";
import configureMockStore from "redux-mock-store";
import { Provider } from "react-redux";
import { PdfViewer } from "../PdfViewer";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { GlobalState } from "../../../../../store/reducers/types";

describe("PdfViewer", () => {
  it("should match the snapshot", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const enrichedState = {
      ...globalState,
      persistedPreferences: {
        ...globalState.persistedPreferences,
        isDesignSystemEnabled: true
      }
    };
    const mockStore = configureMockStore<GlobalState>();
    const store: ReturnType<typeof mockStore> = mockStore(enrichedState);
    const component = render(
      <Provider store={store}>
        <PdfViewer downloadPath={"file:///randomFile.pdf"} />
      </Provider>
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});
