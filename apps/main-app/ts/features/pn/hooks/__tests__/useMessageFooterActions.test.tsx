import { FooterActions } from "@io-app/design-system";
import { ComponentProps } from "react";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { mockAccessibilityInfo } from "../../../../utils/testAccessibility";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import * as standardPayments from "../../../messages/store/reducers/payments";
import * as payments from "../../store/reducers/payments";
import {
  useMessageFooterActions,
  UseMessageFooterActionsProps
} from "../useMessageFooterActions";

describe("useMessageFooterActions", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockAccessibilityInfo(false);
    jest
      .spyOn(standardPayments, "canNavigateToPaymentFromMessageSelector")
      .mockReturnValue(true);
  });

  it("returns no actions for a cancelled notification", () => {
    jest
      .spyOn(payments, "paymentsButtonStateSelector")
      .mockReturnValue("visibleEnabled");

    expect(renderActions({ isCancelled: true })).toBeUndefined();
  });

  it("returns no actions when the payment button is hidden", () => {
    jest
      .spyOn(payments, "paymentsButtonStateSelector")
      .mockReturnValue("hidden");

    expect(renderActions()).toBeUndefined();
  });

  it("returns a loading action while payment data is loading", () => {
    jest
      .spyOn(payments, "paymentsButtonStateSelector")
      .mockReturnValue("visibleLoading");

    expect(renderActions()?.primary).toMatchObject({
      disabled: true,
      loading: true
    });
  });

  it("returns an enabled action when payment data is available", () => {
    jest
      .spyOn(payments, "paymentsButtonStateSelector")
      .mockReturnValue("visibleEnabled");

    expect(renderActions()).toMatchObject({
      type: "SingleButton",
      primary: {
        disabled: false,
        loading: false
      }
    });
  });
});

const defaultProps: UseMessageFooterActionsProps = {
  isCancelled: false,
  maxVisiblePaymentCount: 5,
  messageId: "01HRAAFS3VJAAKWKV8NM8Z6CPQ",
  payments: undefined,
  presentPaymentsBottomSheetRef: { current: jest.fn() },
  sendOpeningSource: "aar",
  sendUserType: "recipient"
};

const renderActions = (props: Partial<UseMessageFooterActionsProps> = {}) => {
  const actionSpy = jest.fn<
    void,
    [ComponentProps<typeof FooterActions>["actions"]]
  >();
  const Component = () => {
    actionSpy(useMessageFooterActions({ ...defaultProps, ...props }));
    return null;
  };
  const initialState = appReducer(undefined, applicationChangeState("active"));

  renderScreenWithNavigationStoreContext(
    Component,
    "DUMMY",
    {},
    createStore(appReducer, initialState as any)
  );

  return actionSpy.mock.calls[actionSpy.mock.calls.length - 1]?.[0];
};
