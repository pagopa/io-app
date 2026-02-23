import { H3 } from "@pagopa/io-app-design-system";
import { render } from "@testing-library/react-native";
import { withWalletCardBaseComponent } from "../WalletCardBaseComponent";

describe("WalletCardBaseComponent", () => {
  it("should render the card content correctly", () => {
    const innerComponent = () => <H3>Hello!</H3>;
    const { queryByText } = render(
      withWalletCardBaseComponent(innerComponent)({
        cardProps: {},
        isStacked: false
      })
    );
    expect(queryByText("Hello!")).not.toBeNull();
  });
});
