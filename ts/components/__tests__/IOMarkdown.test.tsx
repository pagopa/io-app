import { createStore } from "redux";
import IOMarkdown from "../IOMarkdown";
import { appReducer } from "../../store/reducers";
import { applicationChangeState } from "../../store/actions/application";
import { renderScreenWithNavigationStoreContext } from "../../utils/testWrapper";
import { MESSAGES_ROUTES } from "../../features/messages/navigation/routes";

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
    const component = renderComponent(markdownString);
    expect(component).toMatchSnapshot();
  });
});

const renderComponent = (markdown: string) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    () => <IOMarkdown content={markdown} />,
    MESSAGES_ROUTES.MESSAGE_DETAIL,
    {},
    store
  );
};
