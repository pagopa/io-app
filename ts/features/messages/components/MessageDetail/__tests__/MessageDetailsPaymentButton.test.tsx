import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { MessageDetailsPaymentButton } from "../MessageDetailsPaymentButton";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { PaymentData } from "../../../types";
import { ServiceId } from "../../../../../../definitions/services/ServiceId";

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
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    () => (
      <MessageDetailsPaymentButton
        serviceId={"01J5ZQEMZ92CJN7NKZD4NE0RAH" as ServiceId}
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
