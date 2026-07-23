import { createStore } from "redux";

import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { mockAccessibilityInfo } from "../../../../utils/testAccessibility";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import * as standardPayments from "../../../messages/store/reducers/payments";
import * as payments from "../../store/reducers/payments";
import { MessageFooter } from "../MessageFooter";

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
  isCancelled = false,
  messageId = "01HRAAFS3VJAAKWKV8NM8Z6CPQ",
  maxVisiblePaymentCount = 5
) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);
  const mockRef = {
    current: jest.fn()
  };

  return renderScreenWithNavigationStoreContext(
    () => (
      <MessageFooter
        isCancelled={isCancelled}
        maxVisiblePaymentCount={maxVisiblePaymentCount}
        messageId={messageId}
        onMeasure={() => void 0}
        payments={undefined}
        presentPaymentsBottomSheetRef={mockRef}
        sendOpeningSource={"aar"}
        sendUserType={"recipient"}
      />
    ),
    "DUMMY",
    {},
    store
  );
};
