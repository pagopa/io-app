import { fromNullable } from "fp-ts/lib/Either";
import React from "react";
import { createStore, combineReducers, Reducer } from "redux";
import { fireEvent } from "@testing-library/react-native";
// Import reducers
import { reducer as networkReducer } from "react-native-offline";
// import walletReducer from "../../../store/reducers/wallet";
import contentReducer from "../../../store/reducers/content";
import searchReducer from "../../../store/reducers/search";
import persistedPreferencesReducer from "../../../store/reducers/persistedPreferences";
import instabugUnreadMessagesReducer from "../../../store/reducers/instabug/instabugUnreadMessages";

import AddCardScreen from "../AddCardScreen";
import { initState } from "./TestUtilsAddCardScreen";
import { renderWithRedux } from "./TestUtils";

// Jest Configuration
jest.useFakeTimers();

// Navigation mock (It's a custom mock. In particular mocks useNavigation hook)
jest.mock("react-navigation");

// Combine needed reducers avoiding persistence
const appReducer: Reducer<any, any> = combineReducers<any, any>({
  //
  // Keep all state ephemeral!!
  //
  network: networkReducer,
  instabug: instabugUnreadMessagesReducer,
  search: searchReducer,
  persistedPreferences: persistedPreferencesReducer,
  content: contentReducer
});

it("Renders Correctly with the Full Store", () => {
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
    { initialState: initState, store: createStore(appReducer, initState) }
  );

  expect(toJSON()).toMatchSnapshot();

  // Check in the snapshot a good value to search for, but be aware of locales!
  const myElement = getByPlaceholderText(/John Doe/);
  fireEvent.changeText(myElement, "Aulo Agerio");
  expect(myElement.props.value).toEqual("Aulo Agerio");
});
