import { act, render } from "@testing-library/react-native";
import I18n from "i18next";

import { CgnDiscountExpireProgressBar } from "../CgnDiscountExpireProgressBar";
describe("CgnDiscountExpireProgressBar", () => {
  it("should render the component with correct progress and time", () => {
    const mockSetIsExpired = jest.fn();
    const { getByText } = render(
      <CgnDiscountExpireProgressBar
        secondsExpirationTotal={300}
        secondsToExpiration={120}
        setIsExpired={mockSetIsExpired}
      />
    );
    expect(
      getByText(I18n.t("idpay.barCode.resultScreen.success.expiresIn"))
    ).toBeTruthy();
    expect(getByText("02:00")).toBeTruthy();
  });

  it("should call setIsExpired when the timer expires", () => {
    jest.useFakeTimers();
    const mockSetIsExpired = jest.fn();
    render(
      <CgnDiscountExpireProgressBar
        secondsExpirationTotal={300}
        secondsToExpiration={1}
        setIsExpired={mockSetIsExpired}
      />
    );
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(mockSetIsExpired).toHaveBeenCalledWith(true);
  });
});
