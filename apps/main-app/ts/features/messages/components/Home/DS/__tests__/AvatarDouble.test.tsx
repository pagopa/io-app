import { fireEvent, render } from "@testing-library/react-native";

import { AvatarDouble } from "../AvatarDouble";

const imageTestId = "avatar_double_background_image";

describe("AvatarDouble", () => {
  const logoA = [
    { uri: "https://logos/a-service.png" },
    { uri: "https://logos/a-org.png" }
  ];
  const logoB = [
    { uri: "https://logos/b-service.png" },
    { uri: "https://logos/b-org.png" }
  ];

  const renderedUri = (component: ReturnType<typeof render>) =>
    component.queryByTestId(imageTestId)?.props.source.uri;

  it("shows the new logo when the source changes", () => {
    const component = render(<AvatarDouble backgroundLogoUri={logoA} />);
    expect(renderedUri(component)).toBe(logoA[0].uri);

    component.rerender(<AvatarDouble backgroundLogoUri={logoB} />);

    expect(renderedUri(component)).toBe(logoB[0].uri);
  });

  it("restarts from the first source of the new logo after a fallback on the previous one", () => {
    const component = render(<AvatarDouble backgroundLogoUri={logoA} />);
    fireEvent(component.getByTestId(imageTestId), "error");
    expect(renderedUri(component)).toBe(logoA[1].uri);

    component.rerender(<AvatarDouble backgroundLogoUri={logoB} />);
    expect(renderedUri(component)).toBe(logoB[0].uri);

    fireEvent(component.getByTestId(imageTestId), "error");
    expect(renderedUri(component)).toBe(logoB[1].uri);
  });

  it("shows the placeholder when the new logo has no source", () => {
    const component = render(<AvatarDouble backgroundLogoUri={logoA} />);
    component.rerender(<AvatarDouble backgroundLogoUri={undefined} />);

    expect(component.queryByTestId(imageTestId)).toBeNull();
  });
});
