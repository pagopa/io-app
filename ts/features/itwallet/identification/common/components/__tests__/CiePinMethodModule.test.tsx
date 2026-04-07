import { render } from "@testing-library/react-native";

import { CiePinMethodModule } from "../CiePinMethodModule";

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

describe("CiePinMethodModule", () => {
  it("renders correctly for L2 issuance", () => {
    const { toJSON } = render(
      <CiePinMethodModule isL3={false} isReissuanceMode={false} />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders correctly for L2 reissuance (shows recommended badge)", () => {
    const { toJSON } = render(
      <CiePinMethodModule isL3={false} isReissuanceMode={true} />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders correctly for L3", () => {
    const { toJSON } = render(
      <CiePinMethodModule isL3={true} isReissuanceMode={false} />
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
