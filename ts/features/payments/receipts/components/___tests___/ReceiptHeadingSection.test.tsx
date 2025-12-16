import { createStore } from "redux";
import { OriginEnum } from "../../../../../../definitions/pagopa/biz-events/InfoNotice";
import { NoticeDetailResponse } from "../../../../../../definitions/pagopa/biz-events/NoticeDetailResponse";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { PaymentsReceiptRoutes } from "../../navigation/routes";
import { ReceiptHeadingSection } from "../ReceiptHeadingSection";

const renderComponent = (
  isLoading: boolean,
  transaction?: NoticeDetailResponse
) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    () => (
      <ReceiptHeadingSection isLoading={isLoading} transaction={transaction} />
    ),
    PaymentsReceiptRoutes.PAYMENT_RECEIPT_DETAILS,
    {},
    store
  );
};

describe("ReceiptHeadingSection", () => {
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
