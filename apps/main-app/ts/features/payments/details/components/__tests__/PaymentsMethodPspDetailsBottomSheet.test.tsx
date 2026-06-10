import { usePaymentsMethodPspDetailsBottomSheet } from "../PaymentsMethodPspDetailsBottomSheet";

jest.mock("../../../../../utils/hooks/bottomSheet", () => ({
  useIOBottomSheetModal: jest.fn(() => ({
    bottomSheet: <></>,
    present: jest.fn(),
    dismiss: jest.fn()
  }))
}));

describe("usePaymentsMethodPspDetailsBottomSheet", () => {
  it("should return the correct modal hook values", () => {
    const { bottomSheet, present, dismiss } =
      usePaymentsMethodPspDetailsBottomSheet("Test PSP");

    expect(bottomSheet).toBeDefined();
    expect(typeof present).toBe("function");
    expect(typeof dismiss).toBe("function");
  });
});
