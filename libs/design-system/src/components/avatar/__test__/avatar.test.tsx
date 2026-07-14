import { render } from "@testing-library/react-native";
import { renderWithExperimentalEnabledContextProvider } from "../../../utils/testing";
import { Avatar, AvatarSearch } from "../Avatar";

describe("Test Avatar Components", () => {
  it("Avatar Snapshot", () => {
    const { toJSON } = render(<Avatar size={"small"} logoUri={{ uri: "" }} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it("AvatarSearch Snapshot", () => {
    const { toJSON } = render(<AvatarSearch source={{ uri: "" }} />);
    expect(toJSON()).toMatchSnapshot();
  });
});

describe("Test Avatar Components - Experimental Enabled", () => {
  it("Avatar Snapshot", () => {
    const { toJSON } = renderWithExperimentalEnabledContextProvider(
      <Avatar size={"small"} logoUri={{ uri: "" }} />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("AvatarSearch Snapshot", () => {
    const { toJSON } = renderWithExperimentalEnabledContextProvider(
      <AvatarSearch source={{ uri: "" }} />
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
