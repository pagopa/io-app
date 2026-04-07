import { render } from "@testing-library/react-native";

import { SpidMethodModule } from "../SpidMethodModule";

jest.mock("../../../../machine/eid/provider", () => ({
  ItwEidIssuanceMachineContext: {
    useActorRef: () => ({ send: jest.fn() })
  }
}));

jest.mock("../../hooks/useContinueWithBottomSheet", () => ({
  useContinueWithBottomSheet: () => ({
    bottomSheet: null,
    present: jest.fn(),
    dismiss: jest.fn()
  })
}));

jest.mock("../../../../analytics", () => ({
  trackItWalletIDMethodSelected: jest.fn()
}));

describe("SpidMethodModule", () => {
  it("renders correctly for L2", () => {
    const { toJSON } = render(<SpidMethodModule isL3={false} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders correctly for L3", () => {
    const { toJSON } = render(<SpidMethodModule isL3={true} />);
    expect(toJSON()).toMatchSnapshot();
  });
});
