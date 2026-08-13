import { WalletInfo } from "@io-app/api-types/generated/definitions/pagopa/walletv3/WalletInfo";
import { WalletStatusEnum } from "@io-app/api-types/generated/definitions/pagopa/walletv3/WalletStatus";
import { render } from "@testing-library/react-native";

import WalletDetailsPaymentMethodSettings from "../WalletDetailsPaymentMethodSettings";

jest.mock("../../../../../store/hooks", () => ({
  useIOSelector: jest.fn(),
  useIODispatch: jest.fn(),
  useIOStore: jest.fn()
}));

describe("WalletDetailsPaymentMethodSettings", () => {
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
        type: "",
        maskedNumber: 1,
        instituteCode: 1,
        bankName: ""
      }
    };

    const component = render(
      <WalletDetailsPaymentMethodSettings paymentMethod={paymentMethod} />
    );
    expect(component).toBeTruthy();
  });
});
