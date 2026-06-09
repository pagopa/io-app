import { render } from "@testing-library/react-native";
import ActivityIndicator from "../ActivityIndicator";

describe("ActivityIndicator", () => {
  it("should match the snapshot with default props", () => {
    const { toJSON } = render(<ActivityIndicator />);
    expect(toJSON()).toMatchSnapshot();
  });
});
