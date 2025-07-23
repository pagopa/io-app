import { fireEvent, render } from "@testing-library/react-native";
import { constNull } from "fp-ts/lib/function";
import { ItwWalletId } from "../ItwWalletId";
import { ItwJwtCredentialStatus } from "../../utils/itwTypesUtils";
import I18n from "../../../../../i18n";

describe("ItwWalletId", () => {
  test.each([true, false])(
    "should match snapshot when isStacked prop is %p",
    isStacked => {
      const component = render(
        <ItwWalletId isStacked={isStacked} onShowPress={constNull} />
      );

      expect(component).toMatchSnapshot();
    }
  );

  test.each([
    "valid",
    "jwtExpired",
    "jwtExpiring"
  ] as ReadonlyArray<ItwJwtCredentialStatus>)(
    "should match snapshot when PID status is %p",
    pidStatus => {
      const component = render(
        <ItwWalletId pidStatus={pidStatus} onShowPress={constNull} />
      );

      expect(component).toMatchSnapshot();
    }
  );

  it("should call onShowPress when CTA pressed", () => {
    const handlePressMock = jest.fn();
    const { getByText } = render(<ItwWalletId onShowPress={handlePressMock} />);
    const cta = getByText(I18n.t("features.itWallet.walletId.show"));
    fireEvent.press(cta);
    expect(handlePressMock).toHaveBeenCalled();
  });
});
