import { render } from "@testing-library/react-native";
import IOMarkdown from "../IOMarkdown";

const markdownString: string = `
# Main Title

## Subtitle

This is an example of **bold text** and this is an example of *italic text*.

Here is a bullet list:
- Item 1
- Item 2
- Item 3

Here is a numbered list:
1. First
2. Second
3. Third

Here is a link: [Go to Privacy and ToS](ioit://profile/privacy)

Here is an image:
![Alt text](https://via.placeholder.com/150)

Here is a code block:
`;

describe("IOMarkdown", () => {
  it("Should match snapshot", () => {
    const component = render(<IOMarkdown content={markdownString} />);

    expect(component).toMatchSnapshot();
  });
});
