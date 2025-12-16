import { render } from "@testing-library/react-native";
import { ReactNode } from "react";
import { Text } from "react-native";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import { applicationChangeState } from "../../../store/actions/application";
import { appReducer } from "../../../store/reducers";
import { GlobalState } from "../../../store/reducers/types";
import BoxedRefreshIndicator from "../BoxedRefreshIndicator";

describe("BoxedRefreshIndicator", () => {
  it("Should match base snapshot", () => {
    const component = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match all-properties snapshot", () => {
    const action = <Text>This is the action</Text>;
    const caption = <Text>This is the caption</Text>;
    const component = renderComponent(action, caption);
    expect(component.toJSON()).toMatchSnapshot();
  });
});

const renderComponent = (action?: ReactNode, caption?: ReactNode) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(initialState);
  return render(
    <Provider store={store}>
      <BoxedRefreshIndicator action={action} caption={caption} />
    </Provider>
  );
};
