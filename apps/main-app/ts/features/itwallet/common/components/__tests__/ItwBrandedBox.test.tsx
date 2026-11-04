import { render } from "@testing-library/react-native";
import { Text } from "react-native";

import { ItwBrandedBox } from "../ItwBrandedBox";

jest.mock("../../../../../hooks/useReduceMotionEnabled", () => ({
  useReduceMotionEnabled: jest.fn(() => false)
}));

describe("ItwBrandedBox", () => {
  it.each(["default", "warning", "error"] as const)(
    "should render correctly for variant %s",
    variant => {
      const { toJSON } = render(
        <ItwBrandedBox variant={variant}>
          <Text>Test Content</Text>
        </ItwBrandedBox>
      );
      expect(toJSON()).toMatchSnapshot();
    }
  );
});
