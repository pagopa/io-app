import { fireEvent, render } from "@testing-library/react-native";
import { ImageSourcePropType } from "react-native";

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

  it("shows the new logo after a local image failed", () => {
    const component = render(<AvatarDouble backgroundLogoUri={1} />);
    fireEvent(component.getByTestId(imageTestId), "error");
    expect(component.queryByTestId(imageTestId)).toBeNull();

    component.rerender(<AvatarDouble backgroundLogoUri={logoB} />);

    expect(renderedUri(component)).toBe(logoB[0].uri);
  });

  it("keeps the fallback when an equal logo is passed as a new object", () => {
    const component = render(<AvatarDouble backgroundLogoUri={[...logoA]} />);
    fireEvent(component.getByTestId(imageTestId), "error");
    expect(renderedUri(component)).toBe(logoA[1].uri);

    component.rerender(<AvatarDouble backgroundLogoUri={[...logoA]} />);

    expect(renderedUri(component)).toBe(logoA[1].uri);
  });

  test.each<[string, ImageSourcePropType, number]>([
    ["a single remote image", { uri: "https://logos/a.png" }, 1],
    [
      "every remote image",
      [{ uri: "https://logos/a.png" }, { uri: "https://logos/b.png" }],
      2
    ],
    ["a local image", 1, 1],
    ["an image without uri", { headers: {} }, 1]
  ])(
    "shows the placeholder when %s fails to load",
    (_, backgroundLogoUri, errorCount) => {
      const component = render(
        <AvatarDouble backgroundLogoUri={backgroundLogoUri} />
      );
      Array.from({ length: errorCount }).forEach(() =>
        fireEvent(component.getByTestId(imageTestId), "error")
      );

      expect(component.queryByTestId(imageTestId)).toBeNull();
    }
  );
});
