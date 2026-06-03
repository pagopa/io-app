import { IOThemeContextProvider } from "@pagopa/io-app-design-system";
import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import { ItwBrandedBox } from "../ItwBrandedBox";

describe("ItwBrandedBox", () => {
  it.each(["default", "warning", "error"] as const)(
    "should render correctly for variant %s",
    variant => {
      const { toJSON } = render(
        <IOThemeContextProvider theme="light">
          <ItwBrandedBox variant={variant}>
            <Text>Test Content</Text>
          </ItwBrandedBox>
        </IOThemeContextProvider>
      );
      expect(toJSON()).toMatchSnapshot();
    }
  );
});
