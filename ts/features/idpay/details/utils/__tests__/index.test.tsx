import { render } from "@testing-library/react-native";
import { getInitiativeStatus, IdPayCardStatus } from "..";
import { InitiativeDTO } from "../../../../../../definitions/idpay/InitiativeDTO";

describe("IDPay screen details utils tests", () => {
  it("Should getInitiativeStatus correctly for each cases", () => {
    const now = new Date("2023-10-01T00:00:00Z");

    const initiativeActive = {
      status: "REFUNDABLE",
      voucherEndDate: new Date("2023-10-31T00:00:00Z")
    } as InitiativeDTO;

    const initiativeExpiring = {
      status: "REFUNDABLE",
      voucherEndDate: new Date("2023-10-05T00:00:00Z")
    } as InitiativeDTO;

    const initiativeExpired = {
      status: "REFUNDABLE",
      voucherEndDate: new Date("2023-09-30T00:00:00Z")
    } as InitiativeDTO;

    const initiativeRemoved = {
      status: "UNSUBSCRIBED",
      voucherEndDate: new Date("2023-10-31T00:00:00Z")
    } as InitiativeDTO;

    expect(getInitiativeStatus({ initiative: initiativeActive, now })).toBe(
      "ACTIVE"
    );
    expect(getInitiativeStatus({ initiative: initiativeExpiring, now })).toBe(
      "EXPIRING"
    );
    expect(getInitiativeStatus({ initiative: initiativeExpired, now })).toBe(
      "EXPIRED"
    );
    expect(getInitiativeStatus({ initiative: initiativeRemoved, now })).toBe(
      "REMOVED"
    );
  });

  describe("IdPayCardStatus ", () => {
    const now = new Date("2023-10-01T00:00:00Z");
    it("should render ACTIVE status correctly", () => {
      const initiative: InitiativeDTO = {
        initiativeId: "1",
        initiativeName: "Test Initiative",
        organizationName: "Test Organization",
        nInstr: 1,
        lastCounterUpdate: new Date(),
        status: "REFUNDABLE",
        voucherEndDate: new Date("2023-10-31T00:00:00Z")
      } as InitiativeDTO;

      const { getByTestId } = render(
        <IdPayCardStatus now={now} initiative={initiative} />
      );

      expect(getByTestId("idpay-card-status-active")).toBeDefined();
    });

    it("should render EXPIRING status correctly", () => {
      const initiative: InitiativeDTO = {
        initiativeId: "2",
        initiativeName: "Test Initiative",
        organizationName: "Test Organization",
        voucherEndDate: new Date("2023-10-05T00:00:00Z"),
        nInstr: 1,
        lastCounterUpdate: new Date(),
        status: "REFUNDABLE"
      } as InitiativeDTO;

      const { getByTestId } = render(
        <IdPayCardStatus now={now} initiative={initiative} />
      );

      expect(getByTestId("idpay-card-status-expiring")).toBeDefined();
    });

    it("should render EXPIRED status correctly", () => {
      const initiative: InitiativeDTO = {
        initiativeId: "3",
        initiativeName: "Test Initiative",
        organizationName: "Test Organization",
        voucherEndDate: new Date("2023-09-30T00:00:00Z"),
        nInstr: 1,
        lastCounterUpdate: new Date(),
        status: "REFUNDABLE"
      } as InitiativeDTO;

      const { getByTestId } = render(
        <IdPayCardStatus now={now} initiative={initiative} />
      );

      expect(getByTestId("idpay-card-status-expired")).toBeDefined();
    });

    it("should render REMOVED status correctly", () => {
      const initiative: InitiativeDTO = {
        initiativeId: "4",
        initiativeName: "Test Initiative",
        organizationName: "Test Organization",
        voucherEndDate: new Date("2023-10-31T00:00:00Z"),
        nInstr: 1,
        lastCounterUpdate: new Date(),
        status: "UNSUBSCRIBED"
      } as InitiativeDTO;

      const { getByTestId } = render(
        <IdPayCardStatus now={now} initiative={initiative} />
      );

      expect(getByTestId("idpay-card-status-removed")).toBeDefined();
    });
  });
});
