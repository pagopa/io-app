import * as React from "react";
import { Text } from "react-native";
import { render } from "@testing-library/react-native";
import configureMockStore from "redux-mock-store";
import { Provider } from "react-redux";
import { appReducer } from "../../../store/reducers";
import { applicationChangeState } from "../../../store/actions/application";
import { preferencesDesignSystemSetEnabled } from "../../../store/actions/persistedPreferences";
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

const renderComponent = (
  action?: React.ReactNode,
  caption?: React.ReactNode
) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const dsState = appReducer(
    initialState,
    preferencesDesignSystemSetEnabled({ isDesignSystemEnabled: true })
  );
  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(dsState);
  return render(
    <Provider store={store}>
      <BoxedRefreshIndicator action={action} caption={caption} />
    </Provider>
  );
};
