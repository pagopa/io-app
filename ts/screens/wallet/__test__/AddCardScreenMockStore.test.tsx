import "@testing-library/jest-native/extend-expect";
// import { render } from "@testing-library/react-native";
import * as React from "react";
import configureMockStore from "redux-mock-store";
import { fromNullable } from "fp-ts/lib/Either";
import { fireEvent } from "@testing-library/react-native";

import AddCardScreen from "../AddCardScreen";
import { initState } from "./TestUtilsAddCardScreen";
import { renderWithRedux } from "./TestUtils";

// Jest Configuration
jest.useFakeTimers();

// Navigation mock (It's a custom mock. In particular mocks useNavigation hook)
jest.mock("react-navigation");

const mockStore = configureMockStore();

it("Renders Correctly with Mocked Store ", () => {
  const navigation: any = {
    navigate: jest.fn(),
    state: {
      params: {
        inPayment: fromNullable(null),
        keyFrom: "id-1603703747027-2"
      },
      routeName: "WALLET_ADD_CARD",
      key: "id-1603703747027-8"
    },
    router: undefined,
    actions: {}
    // dispatch: jest.fn()
  };
  const { toJSON, getByPlaceholderText } = renderWithRedux(
    <AddCardScreen navigation={navigation} />,
    {
      initialState: initState,
      store: mockStore(initState)
    }
  );
  expect(toJSON()).toMatchSnapshot();

  // Check in the snapshot a good value to search for, but be aware of locales!
  const myElement = getByPlaceholderText(/John Doe/);
  fireEvent.changeText(myElement, "Aulo Agerio");
  expect(myElement.props.value).toEqual("Aulo Agerio");
});
