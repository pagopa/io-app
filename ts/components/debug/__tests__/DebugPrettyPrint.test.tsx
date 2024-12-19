import { render } from "@testing-library/react-native";
import _ from "lodash";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import { applicationChangeState } from "../../../store/actions/application";
import { appReducer } from "../../../store/reducers";
import { GlobalState } from "../../../store/reducers/types";
import { DebugPrettyPrint } from "../DebugPrettyPrint";

describe("DebugPrettyPrint", () => {
  it("should render its content if debug mode is enabled", () => {
    const { queryByTestId } = renderComponent(true);
    expect(queryByTestId("DebugPrettyPrintTestID")).not.toBeNull();
  });
  it("should not render its content if debug mode is disabled", () => {
    const { queryByTestId } = renderComponent(false);
    expect(queryByTestId("DebugPrettyPrintTestID")).toBeNull();
  });
});

const renderComponent = (isDebugModeEnabled: boolean) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(
    _.merge(undefined, globalState, {
      debug: {
        isDebugModeEnabled
      }
    } as GlobalState)
  );

  return render(
    <Provider store={store}>
      <DebugPrettyPrint title="Some title" data={{ item: "value" }} />
    </Provider>
  );
};
