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
  describe.each([true, false])("When isL3 is %s", isL3 => {
    describe.each([true, false])(
      "and isReissuance mode is %s",
      isReissuanceMode => {
        it("renders correctly", () => {
          const { toJSON } = render(
            <CiePinMethodModule
              isL3={isL3}
              isReissuanceMode={isReissuanceMode}
            />
          );
          expect(toJSON()).toMatchSnapshot();
        });
      }
    );
  });
});
