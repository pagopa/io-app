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

describe("AddCardScreen Rendering Logic Test", () => {
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

  test("Should Render Correctly when Disconnected from the Store", () => {
    mockReactRedux().state(initState); // disconnect the component from the store
    const { toJSON } = render(<AddCardScreen navigation={navigation} />);
    expect(toJSON()).toMatchSnapshot();
  });

  test("Should Change Credit Card Owner on User Input", () => {
    // Useless Test. Just to show how to use the library
    mockReactRedux().state(initState); // disconnect the component from the store
    const { getByPlaceholderText } = render(
      <AddCardScreen navigation={navigation} />
    );
    // Check in the snapshot a good value to search for, but be aware of locales!
    const owner = getByPlaceholderText(/John Doe/);
    fireEvent.changeText(owner, "Aulo Agerio");
    expect(owner.props.value).toEqual("Aulo Agerio");
  });

  test("Should Update Icon When User Inserts a PAN of a Supported Brand", () => {
    mockReactRedux().state(initState); // disconnect the component from the store
    const { getByPlaceholderText, getAllByA11yLabel } = render(
      <AddCardScreen navigation={navigation} />
    );
    const pan = getByPlaceholderText(/0000 0000 0000 0000/);

    fireEvent.changeText(pan, "4012888888881881"); // visa
    const fields = getAllByA11yLabel(/labelled-item-icon/);
    const regExp = new RegExp(/visa/);
    const match = fields.find(items => regExp.test(items.props.source.testUri));
    expect(match).toBeTruthy();
  });
});
