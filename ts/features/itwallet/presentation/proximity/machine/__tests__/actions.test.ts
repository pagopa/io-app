import { createProximityActionsImplementation } from "../actions";

describe("createProximityActionsImplementation", () => {
  const pop = jest.fn();

  const navigation = {
    pop
  } as never;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("pops the proximity navigator on success", () => {
    const actions = createProximityActionsImplementation(navigation);

    actions.navigateToWallet();

    expect(pop).toHaveBeenCalledTimes(1);
  });

  it("pops the proximity navigator when closing the flow", () => {
    const actions = createProximityActionsImplementation(navigation);

    actions.closeProximity();

    expect(pop).toHaveBeenCalledTimes(1);
  });
});
