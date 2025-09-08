import { fireEvent, render } from "@testing-library/react-native";
import { Alert } from "react-native";
import {
  InitiativeDTO,
  StatusEnum,
  VoucherStatusEnum
} from "../../../../../../definitions/idpay/InitiativeDTO";
import IdPayRemoveFromWalletButton from "../IdPayRemoveFromWalletButton";
const mockNavigation = jest.fn();

jest.mock("../../../../../store/hooks", () => ({
  useIODispatch: jest.fn(),
  useIOStore: jest.fn(),
  useIOSelector: jest.fn()
}));

jest.mock("../../../../../navigation/params/AppParamsList", () => ({
  useIONavigation: () => ({
    navigate: mockNavigation
  })
}));

const hideButtonProps = {
  initiativeId: "initiativeId",
  initiativeName: "Test Initiative",
  organizationName: "Test Organization",
  voucherEndDate: new Date(),
  voucherStatus: VoucherStatusEnum.USED,
  nInstr: 1,
  lastCounterUpdate: new Date(),
  status: StatusEnum.UNSUBSCRIBED
} as InitiativeDTO;

const mockedInitiative = {
  initiativeId: "initiativeId",
  initiativeName: "Test Initiative",
  organizationName: "Test Organization",
  // end date tomorrow for testing purposes
  voucherStatus: VoucherStatusEnum.EXPIRING,
  voucherEndDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
  nInstr: 1,
  lastCounterUpdate: new Date(),
  status: StatusEnum.REFUNDABLE
} as InitiativeDTO;

describe("IdPayRemoveFromWalletButton", () => {
  beforeAll(() => {
    jest.spyOn(Alert, "alert");
    jest.mock("react-native/Libraries/Utilities/Platform", () => ({
      OS: "ios",
      select: () => null
    }));
  });
  it("should render correctly", () => {
    const { getByTestId } = render(
      <IdPayRemoveFromWalletButton {...mockedInitiative} />
    );
    expect(getByTestId("idpay-remove-from-wallet")).toBeDefined();
  });

  it("should not render when voucher is not expiring or is expired", () => {
    const { queryByTestId } = render(
      <IdPayRemoveFromWalletButton {...hideButtonProps} />
    );
    expect(queryByTestId("idpay-remove-from-wallet")).toBeNull();
  });

  it("should call showAlert on press", () => {
    const { getByTestId } = render(
      <IdPayRemoveFromWalletButton {...mockedInitiative} />
    );
    const button = getByTestId("idpay-remove-from-wallet");
    fireEvent.press(button);

    expect(Alert.alert).toHaveBeenCalled();
  });
});
