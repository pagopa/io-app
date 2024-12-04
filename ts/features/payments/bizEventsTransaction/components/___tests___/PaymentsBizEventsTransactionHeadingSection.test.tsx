import React from "react";
import { createStore } from "redux";
import { OriginEnum } from "../../../../../../definitions/pagopa/biz-events/InfoNotice";
import { NoticeDetailResponse } from "../../../../../../definitions/pagopa/biz-events/NoticeDetailResponse";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { PaymentsTransactionBizEventsRoutes } from "../../navigation/routes";
import { PaymentsBizEventsTransactionHeadingSection } from "../PaymentsBizEventsTransactionHeadingSection";

const renderComponent = (
  isLoading: boolean,
  transaction?: NoticeDetailResponse
) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    () => (
      <PaymentsBizEventsTransactionHeadingSection
        isLoading={isLoading}
        transaction={transaction}
      />
    ),
    PaymentsTransactionBizEventsRoutes.PAYMENT_TRANSACTION_BIZ_EVENTS_DETAILS,
    {},
    store
  );
};

describe("PaymentsBizEventsTransactionHeadingSection", () => {
  it("Should show total amount if transaction is provided", () => {
    const transaction: NoticeDetailResponse = {
      infoNotice: {
        fee: "100",
        eventId: "eventId",
        rrn: "rrn",
        noticeDate: "noticeDate",
        pspName: "pspName",
        amount: "100",
        origin: OriginEnum.INTERNAL
      }
    };

    const { getByTestId } = renderComponent(false, transaction);
    expect(getByTestId("total-amount")).toBeTruthy();
  });

  it("Should not show total amount if transaction is not provided", () => {
    const { queryByTestId } = renderComponent(false);
    expect(queryByTestId("total-amount")).toBeNull();
  });
});
