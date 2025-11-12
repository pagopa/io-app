import { fireEvent, render } from "@testing-library/react-native";
import { constNull } from "fp-ts/lib/function";
import { ItwJwtCredentialStatus } from "../../../common/utils/itwTypesUtils";
import { ItwWalletIdStatus } from "../ItwWalletIdStatus";

describe("ItwWalletIdStatus", () => {
  test.each([
    "valid",
    "jwtExpired",
    "jwtExpiring"
  ] as ReadonlyArray<ItwJwtCredentialStatus>)(
    "should match snapshot when PID status is %p",
    pidStatus => {
      const component = render(
        <ItwWalletIdStatus pidStatus={pidStatus} onPress={constNull} />
      );

      expect(component).toMatchSnapshot();
    }
  );

  it("should call onShowPress when CTA pressed", () => {
    const handlePressMock = jest.fn();
    const { getByTestId } = render(
      <ItwWalletIdStatus onPress={handlePressMock} />
    );
    const cta = getByTestId("itwWalletIdStatusTestID");
    fireEvent.press(cta);
    expect(handlePressMock).toHaveBeenCalled();
  });
});
