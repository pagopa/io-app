import React from "react";
// import { fireEvent } from "@testing-library/react-native";
// import "@testing-library/jest-native/extend-expect";

import { createStore } from "redux";

import {
  fireEvent
  // render
} from "@testing-library/react-native";
import ConfirmPaymentMethodScreen from "../ConfirmPaymentMethodScreen";
import {
  getGlobalState,
  myRptId,
  myInitialAmount,
  myVerifiedData,
  myWallet,
  myPsp
} from "../../../../utils/testFaker";
import {
  renderScreenFakeNavRedux
  // renderShowModal
} from "../../../../utils/testWrapper";
import { appReducer } from "../../../../store/reducers/";
import ROUTES from "../../../../navigation/routes";
// import { mockNavigationFactory } from "../../../../utils/tests";

// Mock react native share
jest.mock("react-native-share", () => jest.fn());

// Be sure that navigation is unmocked
jest.unmock("react-navigation");

describe("Integration Tests With Actual Store and Simplified Navigation", () => {
  afterAll(() => jest.resetAllMocks());
  beforeEach(() => jest.useFakeTimers());

  // Store with the true appReducer
  const initState = getGlobalState();

  // Needed to render correctly the screen
  const params = {
    rptId: myRptId,
    initialAmount: myInitialAmount,
    verifica: myVerifiedData,
    idPayment: "hjkdhgkdj",
    wallet: myWallet,
    psps: [myPsp]
  };

  it("Should fire showModal by pressing the Why-A-Fee Touchable", async () => {
    // Store with the true appReducer
    const myStore = createStore(appReducer, initState);

    // Spy on showModal. Need a Functional Component
    const mySpy = jest.fn();
    // const navSpy = jest.fn(); // uncomment to spy navigatiom

    const toBeTested = (props: any) => (
      <ConfirmPaymentMethodScreen
        {...props}
        // navigation={mockNavigationFactory(params, navSpy)} // uncomment to spy navigation
        showModal={mySpy}
      />
    );
    // Render with simplified but true navigation. Just two screen: the
    // screen under test and a fake screen to navigate without mocking
    const MyObj = renderScreenFakeNavRedux(
      toBeTested,
      ROUTES.PAYMENT_CONFIRM_PAYMENT_METHOD,
      params,
      {
        initialState: initState,
        store: myStore
      }
    );

    // Link Why A Fee? Must be present
    const whyAFeeTouch = MyObj.getByA11yLabel(/why-a-fee/i);
    expect(whyAFeeTouch).toBeDefined();

    // showModal must be called when pressing touchable why-a-fee
    fireEvent.press(whyAFeeTouch);
    expect(mySpy).toHaveBeenCalledTimes(1);

    // TODO: Add a unit test for show modal
  });
});
