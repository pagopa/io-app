import { createProximityActionsImplementation } from "../actions";

jest.mock("../../analytics", () => ({
  trackItwProximityQrCode: jest.fn(),
  trackItwProximityQrCodeLoadingFailure: jest.fn()
}));

describe("createProximityActionsImplementation", () => {
  const pop = jest.fn();

  const navigation = {
    pop
  } as never;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("pops the proximity navigator on success", () => {
    const actions = createProximityActionsImplementation(navigation, {} as any);

    actions.navigateToWallet();

    expect(pop).toHaveBeenCalledTimes(1);
  });

  it("pops the proximity navigator when closing the flow", () => {
    const actions = createProximityActionsImplementation(navigation, {} as any);

    actions.closeProximity();

    expect(pop).toHaveBeenCalledTimes(1);
  });
});
