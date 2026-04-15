import { render } from "@testing-library/react-native";
import I18n from "i18next";
import { PaymentsMethodPspDetailsAlert } from "../PaymentsMethodPspDetailsAlert";

jest.mock("../../../../../store/hooks", () => ({
  useIOSelector: jest.fn(),
  useIODispatch: jest.fn(),
  useIOStore: jest.fn()
}));

jest.mock("react-native-safe-area-context", () => {
  const useSafeAreaInsets = () => ({ top: 0 });
  return {
    useSafeAreaInsets
  };
});

describe("PaymentsMethodPspDetailsAlert", () => {
  it("should render the component with the correct content", () => {
    const pspBusinessName = "Test PSP";
    const { getByText } = render(
      <PaymentsMethodPspDetailsAlert pspBusinessName={pspBusinessName} />
    );

    expect(
      getByText(I18n.t("features.payments.details.pspAlert.title"))
    ).toBeDefined();

    expect(
      getByText(
        I18n.t("features.payments.details.pspAlert.explainationContent", {
          pspBusinessName
        })
      )
    ).toBeDefined();
  });
});
