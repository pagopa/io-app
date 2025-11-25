import { render } from "@testing-library/react-native";
import { testable, CieCardReadContentProps } from "../CieCardReadContent";

const { ContentAndroid, ContentIos } = testable!;

const contentProps: CieCardReadContentProps = {
  title: "Title",
  pictogram: "success",
  progress: 0
};

jest.mock("@react-navigation/native");

describe("ContentAndroid", () => {
  it("should match the snapshot", () => {
    const component = render(<ContentAndroid {...contentProps} />);

    expect(component.toJSON()).toMatchSnapshot();
  });
});

describe("ContentIos", () => {
  it("should match the snapshot", () => {
    const component = render(<ContentIos {...contentProps} />);

    expect(component.toJSON()).toMatchSnapshot();
  });
});
