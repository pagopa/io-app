import { render } from "@testing-library/react-native";
import ItwMarkdown from "../ItwMarkdown";

const sampleMarkdown = `
# I am a Header 1

## I am a Header 2

### I am a Header 3

#### I am a Header 4

##### I am a Header 5

###### I am a Header 6

A simple paragraph.
Text can be emphasized with *asterisk* or _underscore_.
If you need bold use **double asterisk**.
A worked link to [Google](https://www.google.com) with some text.
A malformed link [Error](httssdps://www.error.com) that show toast error.
`;

describe("ItwMarkdown", () => {
  it(`should match snapshot`, () => {
    const component = render(<ItwMarkdown>{sampleMarkdown}</ItwMarkdown>);
    expect(component).toMatchSnapshot();
  });
});
