import { render } from "@testing-library/react-native";
import { MessageDetailsContent } from "../MessageDetailsContent";

describe("MessageDetailsContent component", () => {
  it("should match the snapshot when abstract is defined", () => {
    const component = render(<MessageDetailsContent abstract="abstract" />);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should match the snapshot when abstract is not defined", () => {
    const component = render(<MessageDetailsContent />);
    expect(component.toJSON()).toMatchSnapshot();
  });
});
