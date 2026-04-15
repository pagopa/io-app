import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { MessageListCategory } from "../../../types/messageListCategory";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { MESSAGES_ROUTES } from "../../../navigation/routes";
import { Footer } from "../Footer";
import * as allPaginated from "../../../store/reducers/allPaginated";

describe("Footer", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllTimers();
  });
  it("shoudl match snapshot when output from 'shouldShowFooterListComponentSelector' is false", () => {
    jest
      .spyOn(allPaginated, "shouldShowFooterListComponentSelector")
      .mockImplementation(() => false);
    const footer = renderComponent("INBOX");
    expect(footer.toJSON()).toMatchSnapshot();
  });
  it("shoudl match snapshot when output from 'shouldShowFooterListComponentSelector' is true", () => {
    jest
      .spyOn(allPaginated, "shouldShowFooterListComponentSelector")
      .mockImplementation(() => true);
    const footer = renderComponent("INBOX");
    expect(footer.toJSON()).toMatchSnapshot();
  });
});

const renderComponent = (category: MessageListCategory) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    () => <Footer category={category} />,
    MESSAGES_ROUTES.MESSAGES_HOME,
    {},
    store
  );
};
