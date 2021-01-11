import * as React from "react";
import { Provider } from "react-redux";
import { Store } from "redux";
import configureMockStore from "redux-mock-store";
import { getType } from "typesafe-actions";
import { render, fireEvent } from "@testing-library/react-native";
import AddBPayComponent from "../AddBPayComponent";
import { walletAddBPayStart } from "../../../onboarding/bancomatPay/store/actions";

describe("AddBPayComponent component", () => {
  const mockStore = configureMockStore();
  // eslint-disable-next-line functional/no-let
  let store: ReturnType<typeof mockStore>;

  beforeEach(() => {
    store = mockStore();
  });
  it("Should dispatch walletAddBPayStart on button press", () => {
    const component = getComponent(store);
    const addBPayButton = component.queryByTestId("startAddBPayButton");

    const expectedPayload = {
      type: getType(walletAddBPayStart),
      payload: undefined,
      meta: undefined
    };
    if (addBPayButton) {
      fireEvent.press(addBPayButton);
      expect(store.getActions()).toEqual([expectedPayload]);
    }
  });
});

const getComponent = (store: Store<unknown>) =>
  render(
    <Provider store={store}>
      <AddBPayComponent />
    </Provider>
  );
