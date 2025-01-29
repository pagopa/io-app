import { render } from "@testing-library/react-native";
import LinkedText from "../LinkedText";

type Props = {
  text: string;
  replacementUrl: string;
  onPress: (holder: string) => void;
};

const MOCK_TEXT_ONE_LINK =
  "This is a [linked text](@DOCUMENT_URL) to be clicked";
const MOCK_TEXT_MULTIPLE_LINK =
  "This is a [linked text1](@DOCUMENT_URL) to be clicked. This is a [linked text2](@DOCUMENT_URL) to be clicked.";
const MOCK_TEXT_CUSTOM_LINK =
  "This is a [linked text1](@DOCUMENT_URL) to be clicked. This is a [linked text2](https://fakeUrl.com) to be clicked.";

describe("Test LinkedText component", () => {
  it("should render a LinkedText component with props correctly", () => {
    const props = {
      text: "Clause title 1",
      replacementUrl: "https://fakeUrl.com",
      onPress: jest.fn()
    };
    const component = renderComponent({ ...props });
    expect(component).toBeTruthy();
    expect(component).toMatchSnapshot();
  });
  it("should render a LinkedText component correctly with one link", () => {
    const props = {
      text: MOCK_TEXT_ONE_LINK,
      replacementUrl: "https://fakeUrl.com",
      onPress: jest.fn()
    };
    const component = renderComponent({ ...props });
    expect(component).toBeTruthy();
    expect(component.queryByText("linked text")).toBeTruthy();
  });
  it("should render a LinkedText component correctly with text and multiple link", () => {
    const props = {
      text: MOCK_TEXT_MULTIPLE_LINK,
      replacementUrl: "https://fakeUrl.com",
      onPress: jest.fn()
    };
    const component = renderComponent({ ...props });
    expect(component).toBeTruthy();
    expect(component.queryByText("linked text1")).toBeTruthy();
    expect(component.queryByText("linked text2")).toBeTruthy();
  });
  it("should render a LinkedText component correctly with text and multiple custom link", () => {
    const onPressDetail = jest.fn();
    const props = {
      text: MOCK_TEXT_CUSTOM_LINK,
      replacementUrl: "https://fakeUrl.com",
      onPress: onPressDetail
    };
    const component = renderComponent({ ...props });
    expect(component).toBeTruthy();
    expect(component.queryByText("linked text1")).toBeTruthy();
    expect(component.queryByText("linked text2")).toBeTruthy();
  });
});

const renderComponent = (props: Props) => render(<LinkedText {...props} />);
