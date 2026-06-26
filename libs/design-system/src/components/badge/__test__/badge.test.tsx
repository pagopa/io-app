import { render } from "@testing-library/react-native";
import { renderWithExperimentalEnabledContextProvider } from "../../../utils/testing";
import { Badge } from "../Badge";

describe("Test Badge Components", () => {
  it("Badge Snapshot", () => {
    const { toJSON } = render(<Badge text={"text"} variant={"default"} />);
    expect(toJSON()).toMatchSnapshot();
  });
});

describe("Test Badge Components - Experimental Enabled", () => {
  it("Badge Snapshot", () => {
    const { toJSON } = renderWithExperimentalEnabledContextProvider(
      <Badge text={"text"} variant={"default"} />
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
