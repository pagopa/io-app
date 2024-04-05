import * as React from "react";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../store/actions/application";
import { preferencesDesignSystemSetEnabled } from "../../../../store/actions/persistedPreferences";
import { appReducer } from "../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { UIMessageId } from "../../../messages/types";
import { LegacyMessageFooter } from "../LegacyMessageFooter";
import * as standardPayments from "../../../messages/store/reducers/payments";
import * as payments from "../../store/reducers/payments";

describe("LegacyMessageFooter", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
    jest
      .spyOn(standardPayments, "canNavigateToPaymentFromMessageSelector")
      .mockReturnValue(true);
  });
  it("should match snapshot for cancelled PN notification", () => {
    jest
      .spyOn(payments, "paymentsButtonStateSelector")
      .mockReturnValue("visibleEnabled");
    const component = renderScreen(true);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot for hidden button", () => {
    jest
      .spyOn(payments, "paymentsButtonStateSelector")
      .mockReturnValue("hidden");
    const component = renderScreen();
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot for visibleLoading button", () => {
    jest
      .spyOn(payments, "paymentsButtonStateSelector")
      .mockReturnValue("visibleLoading");
    const component = renderScreen();
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot for visibleEnabled button", () => {
    jest
      .spyOn(payments, "paymentsButtonStateSelector")
      .mockReturnValue("visibleEnabled");
    const component = renderScreen();
    expect(component.toJSON()).toMatchSnapshot();
  });
});

const renderScreen = (
  isCancelled: boolean = false,
  messageId: UIMessageId = "01HRAAFS3VJAAKWKV8NM8Z6CPQ" as UIMessageId,
  maxVisiblePaymentCount: number = 5
) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const designSystemState = appReducer(
    initialState,
    preferencesDesignSystemSetEnabled({ isDesignSystemEnabled: true })
  );
  const store = createStore(appReducer, designSystemState as any);
  const mockRef = {
    current: jest.fn()
  };

  return renderScreenWithNavigationStoreContext(
    () => (
      <LegacyMessageFooter
        messageId={messageId}
        maxVisiblePaymentCount={maxVisiblePaymentCount}
        isCancelled={isCancelled}
        payments={undefined}
        presentPaymentsBottomSheetRef={mockRef}
      />
    ),
    "DUMMY",
    {},
    store
  );
};
