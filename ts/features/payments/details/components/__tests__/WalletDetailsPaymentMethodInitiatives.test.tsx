import { fireEvent, render } from "@testing-library/react-native";
import I18n from "i18next";
import { WalletStatusEnum } from "../../../../../../definitions/pagopa/walletv3/WalletStatus";
import WalletDetailsPaymentMethodInitiatives from "../WalletDetailsPaymentMethodInitiatives";

const mockNavigate = jest.fn();

jest.mock("../../../../../store/hooks", () => ({
  useIODispatch: jest.fn(),
  useIOStore: jest.fn(),
  useIOSelector: jest.fn(() => [
    { id: "1", name: "Initiative 1" },
    { id: "2", name: "Initiative 2" }
  ])
}));

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: jest.fn(),
    setOptions: jest.fn
  }),
  useRoute: jest.fn,
  useFocusEffect: jest.fn
}));

jest.mock("@react-navigation/stack", () => ({ createStackNavigator: jest.fn }));

describe("WalletDetailsPaymentMethodInitiatives", () => {
  it("should render without crashing", () => {
    const component = render(
      <WalletDetailsPaymentMethodInitiatives
        paymentMethod={{
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
        }}
      />
    );
    expect(component).toBeTruthy();
  });

  it("should navigate on pressing initiative link", () => {
    const component = render(
      <WalletDetailsPaymentMethodInitiatives
        paymentMethod={{
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
        }}
      />
    );

    const initiativeLink = component.getByText(
      I18n.t("idpay.wallet.card.showAll")
    );
    fireEvent.press(initiativeLink);
    expect(mockNavigate).toHaveBeenCalled();
  });
});
