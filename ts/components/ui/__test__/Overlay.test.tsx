import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import { Overlay } from "../Overlay";

describe("Overlay", () => {
  it("Should match base snapshot", () => {
    const component = render(<Overlay />);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match all-properties snapshot", () => {
    const backgroundColor = "#FF0000";
    const opacity = 0.65;
    const foreground = <Text>This is a foreground</Text>;
    const children = <Text>This is a child</Text>;
    const component = render(
      <Overlay
        backgroundColor={backgroundColor}
        opacity={opacity}
        foreground={foreground}
      >
        {children}
      </Overlay>
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});
