import { createStore } from "redux";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { UIMessageId } from "../../../messages/types";
import { MessageFooter } from "../MessageFooter";
import * as standardPayments from "../../../messages/store/reducers/payments";
import * as payments from "../../store/reducers/payments";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { mockAccessibilityInfo } from "../../../../utils/testAccessibility";

describe("MessageFooter", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
    mockAccessibilityInfo(false);
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
  const store = createStore(appReducer, initialState as any);
  const mockRef = {
    current: jest.fn()
  };

  return renderScreenWithNavigationStoreContext(
    () => (
      <MessageFooter
        messageId={messageId}
        serviceId={"01J5ZQFP9Q24CEJK6GJ2105H7C" as ServiceId}
        maxVisiblePaymentCount={maxVisiblePaymentCount}
        isCancelled={isCancelled}
        payments={undefined}
        presentPaymentsBottomSheetRef={mockRef}
        onMeasure={() => void 0}
      />
    ),
    "DUMMY",
    {},
    store
  );
};
