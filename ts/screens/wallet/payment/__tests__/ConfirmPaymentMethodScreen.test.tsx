import React from "react";
import { createStore, Store } from "redux";
import { fireEvent } from "@testing-library/react-native";

import ConfirmPaymentMethodScreen, {
  NavigationParams
} from "../ConfirmPaymentMethodScreen";
import {
  myRptId,
  myInitialAmount,
  myVerifiedData,
  myWallet,
  myPsp,
  AuthSeq
} from "../../../../utils/testFaker";
import { renderScreenFakeNavRedux } from "../../../../utils/testWrapper";
import { appReducer } from "../../../../store/reducers/";
import ROUTES from "../../../../navigation/routes";
import { LightModalContext } from "../../../../components/ui/LightModal";
import { GlobalState } from "../../../../store/reducers/types";
import { reproduceSequence } from "../../../../utils/tests";

// Mock react native share
jest.mock("react-native-share", () => jest.fn());

// Be sure that navigation is unmocked
jest.unmock("react-navigation");

describe("Integration Tests With Actual Store and Simplified Navigation", () => {
  afterAll(() => jest.resetAllMocks());
  beforeEach(() => jest.useFakeTimers());
  const initState = reproduceSequence({} as GlobalState, appReducer, AuthSeq);
  const params: NavigationParams = {
    rptId: myRptId,
    initialAmount: myInitialAmount,
    verifica: myVerifiedData,
    idPayment: "hjkdhgkdj",
    wallet: myWallet,
    psps: [myPsp]
  };

  it("Should fire showModal by pressing the Why-A-Fee Touchable", async () => {
    // Store with the true appReducer
    const myStore: Store<GlobalState> = createStore(
      appReducer,
      initState as any
    );

    // Spy on showModa
    const mySpy = jest.fn();

    const ToBeTested: React.FunctionComponent<
      React.ComponentProps<typeof ConfirmPaymentMethodScreen>
    > = (props: React.ComponentProps<typeof ConfirmPaymentMethodScreen>) => (
      <LightModalContext.Provider
        value={{
          component: null,
          showModal: mySpy,
          showAnimatedModal: jest.fn(),
          showModalFadeInAnimation: jest.fn(),
          hideModal: jest.fn(),
          onHiddenModal: jest.fn(),
          setOnHiddenModal: jest.fn()
        }}
      >
        <ConfirmPaymentMethodScreen {...props} />
      </LightModalContext.Provider>
    );

    // Render with simplified but true navigation. Just two screen: the
    // screen under test and a fake screen to navigate without mocking
    const MyObj = renderScreenFakeNavRedux<GlobalState, NavigationParams>(
      ToBeTested,
      ROUTES.PAYMENT_CONFIRM_PAYMENT_METHOD,
      params,
      myStore
    );

    // Link Why A Fee? Must be present
    const whyAFeeTouch = MyObj.getByTestId(/why-a-fee/i);
    expect(whyAFeeTouch).toBeDefined();

    // showModal must be called when pressing touchable why-a-fee
    fireEvent.press(whyAFeeTouch);
    expect(mySpy).toHaveBeenCalledTimes(1);
  });
});
