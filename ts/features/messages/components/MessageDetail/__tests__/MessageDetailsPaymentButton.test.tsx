import * as React from "react";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { preferencesDesignSystemSetEnabled } from "../../../../../store/actions/persistedPreferences";
import { appReducer } from "../../../../../store/reducers";
import { MessageDetailsPaymentButton } from "../MessageDetailsPaymentButton";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { PaymentData, UIMessageId } from "../../../types";

describe("MessageDetailsPaymentButton", () => {
  it("should match snapshot when not loading", () => {
    const screen = renderScreen(false);
    expect(screen.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot when loading", () => {
    const screen = renderScreen(true);
    expect(screen.toJSON()).toMatchSnapshot();
  });
});

const renderScreen = (isLoading: boolean) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const designSystemState = appReducer(
    initialState,
    preferencesDesignSystemSetEnabled({ isDesignSystemEnabled: true })
  );
  const store = createStore(appReducer, designSystemState as any);

  return renderScreenWithNavigationStoreContext(
    () => (
      <MessageDetailsPaymentButton
        messageId={"" as UIMessageId}
        canNavigateToPayment={true}
        isLoading={isLoading}
        paymentData={
          {
            amount: 199,
            noticeNumber: "012345678912345670",
            payee: {
              fiscalCode: "01234567890"
            }
          } as PaymentData
        }
      />
    ),
    "DUMMY",
    {},
    store
  );
};
