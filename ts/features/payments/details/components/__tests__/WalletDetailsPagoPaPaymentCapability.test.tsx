import { render } from "@testing-library/react-native";
import { WalletInfo } from "../../../../../../definitions/pagopa/walletv3/WalletInfo";
import { WalletStatusEnum } from "../../../../../../definitions/pagopa/walletv3/WalletStatus";
import WalletDetailsPagoPaPaymentCapability from "../WalletDetailsPagoPaPaymentCapability";

jest.mock("../../../../../store/hooks", () => ({
  useIOSelector: jest.fn(),
  useIODispatch: jest.fn(),
  useIOStore: jest.fn()
}));

describe("WalletDetailsPagoPaPaymentCapability", () => {
  it("should render without crashing", () => {
    const paymentMethod: WalletInfo = {
      walletId: "1",
      creationDate: new Date(),
      applications: [],
      paymentMethodAsset: "",
      paymentMethodId: "",
      status: WalletStatusEnum.CREATED,
      clients: {},
      updateDate: new Date(),
      details: {
        type: "CREDIT_CARD",
        maskedNumber: 1234,
        instituteCode: 1,
        bankName: "Test Bank"
      }
    };

    const component = render(
      <WalletDetailsPagoPaPaymentCapability paymentMethod={paymentMethod} />
    );
    expect(component).toBeTruthy();
  });
});
