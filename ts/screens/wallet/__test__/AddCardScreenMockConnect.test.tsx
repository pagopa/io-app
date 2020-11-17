import { fromNullable } from "fp-ts/lib/Either";
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import "@testing-library/jest-dom/extend-expect";

// import { NavigationContainer } from "@react-navigation/native";
// import { createStackNavigator } from "@react-navigation/stack";
import { mockReactRedux } from "mock-react-redux";

import AddCardScreen from "../AddCardScreen";
import { initState } from "./TestUtilsAddCardScreen";

// Jest Configuration
jest.useFakeTimers();

// Navigation mock (It's a custom mock. In particular mocks useNavigation hook)
jest.mock("react-navigation");

it("Renders Correctly when Disconnected from the Store", () => {
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
  };

  mockReactRedux().state(initState); // disconnect the component from the store
  const { toJSON, getByPlaceholderText } = render(
    <AddCardScreen navigation={navigation} />
  );
  expect(toJSON()).toMatchSnapshot();

  // Check in the snapshot a good value to search for, but be aware of locales!
  const myElement = getByPlaceholderText(/John Doe/);
  fireEvent.changeText(myElement, "Aulo Agerio");
  expect(myElement.props.value).toEqual("Aulo Agerio");
});
