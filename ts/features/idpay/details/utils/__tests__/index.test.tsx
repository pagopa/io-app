import { render } from "@testing-library/react-native";
import { IdPayCardStatus } from "..";
import {
  InitiativeDTO,
  VoucherStatusEnum
} from "../../../../../../definitions/idpay/InitiativeDTO";

describe("IDPay screen details utils tests", () => {
  describe("IdPayCardStatus ", () => {
    it("should render ACTIVE status correctly", () => {
      const initiative: InitiativeDTO = {
        initiativeId: "1",
        initiativeName: "Test Initiative",
        organizationName: "Test Organization",
        nInstr: 1,
        voucherStatus: VoucherStatusEnum.ACTIVE,
        lastCounterUpdate: new Date(),
        status: "REFUNDABLE",
        voucherEndDate: new Date("2023-10-31T00:00:00Z")
      } as InitiativeDTO;

      const { getByTestId } = render(
        <IdPayCardStatus initiative={initiative} />
      );

      expect(getByTestId("idpay-card-status-active")).toBeDefined();
    });

    it("should render EXPIRING status correctly", () => {
      const initiative: InitiativeDTO = {
        initiativeId: "2",
        initiativeName: "Test Initiative",
        organizationName: "Test Organization",
        voucherEndDate: new Date("2023-10-05T00:00:00Z"),
        voucherStatus: VoucherStatusEnum.EXPIRING,
        nInstr: 1,
        lastCounterUpdate: new Date(),
        status: "REFUNDABLE"
      } as InitiativeDTO;

      const { getByTestId } = render(
        <IdPayCardStatus initiative={initiative} />
      );

      expect(getByTestId("idpay-card-status-expiring")).toBeDefined();
    });

    it("should render EXPIRED status correctly", () => {
      const initiative: InitiativeDTO = {
        initiativeId: "3",
        initiativeName: "Test Initiative",
        organizationName: "Test Organization",
        voucherEndDate: new Date("2023-09-30T00:00:00Z"),
        voucherStatus: VoucherStatusEnum.EXPIRED,
        nInstr: 1,
        lastCounterUpdate: new Date(),
        status: "REFUNDABLE"
      } as InitiativeDTO;

      const { getByTestId } = render(
        <IdPayCardStatus initiative={initiative} />
      );

      expect(getByTestId("idpay-card-status-expired")).toBeDefined();
    });

    it("should render USED status correctly", () => {
      const initiative: InitiativeDTO = {
        initiativeId: "4",
        initiativeName: "Test Initiative",
        organizationName: "Test Organization",
        voucherEndDate: new Date("2023-10-31T00:00:00Z"),
        voucherStatus: VoucherStatusEnum.USED,
        nInstr: 1,
        lastCounterUpdate: new Date(),
        status: "UNSUBSCRIBED"
      } as InitiativeDTO;

      const { getByTestId } = render(
        <IdPayCardStatus initiative={initiative} />
      );

      expect(getByTestId("idpay-card-status-used")).toBeDefined();
    });
  });
});
