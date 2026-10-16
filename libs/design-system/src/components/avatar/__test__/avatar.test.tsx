import { fireEvent, render } from "@testing-library/react-native";

import { renderWithExperimentalEnabledContextProvider } from "../../../utils/testing";
import { Avatar, AvatarSearch } from "../Avatar";

describe("Test Avatar Components", () => {
  it("Avatar Snapshot", () => {
    const { toJSON } = render(<Avatar logoUri={{ uri: "" }} size={"small"} />);
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
      <Avatar logoUri={{ uri: "" }} size={"small"} />
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

describe("Avatar logo updates", () => {
  const logoA = [
    { uri: "https://logos/a-service.png" },
    { uri: "https://logos/a-org.png" }
  ];
  const logoB = [
    { uri: "https://logos/b-service.png" },
    { uri: "https://logos/b-org.png" }
  ];

  // Until a fallback is needed, the whole array is handed to the `Image`
  const renderedUri = (component: ReturnType<typeof render>) => {
    const source = component.queryByTestId("avatar_image")?.props.source;
    return Array.isArray(source) ? source[0].uri : source?.uri;
  };

  it("shows the new logo when the source changes", () => {
    const component = render(<Avatar logoUri={logoA} size="small" />);
    expect(renderedUri(component)).toBe(logoA[0].uri);

    component.rerender(<Avatar logoUri={logoB} size="small" />);

    expect(renderedUri(component)).toBe(logoB[0].uri);
  });

  it("restarts from the first source of the new logo after a fallback on the previous one", () => {
    const component = render(<Avatar logoUri={logoA} size="small" />);
    fireEvent(component.getByTestId("avatar_image"), "error");
    expect(renderedUri(component)).toBe(logoA[1].uri);

    component.rerender(<Avatar logoUri={logoB} size="small" />);
    expect(renderedUri(component)).toBe(logoB[0].uri);

    fireEvent(component.getByTestId("avatar_image"), "error");
    expect(renderedUri(component)).toBe(logoB[1].uri);
  });

  it("shows the placeholder again when the new logo has no source after the previous one failed", () => {
    const component = render(<Avatar logoUri={logoA} size="small" />);
    component.rerender(<Avatar logoUri={undefined} size="small" />);

    expect(component.queryByTestId("avatar_image")).toBeNull();
  });
});
