import { render } from "@testing-library/react-native";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import { ItwHighlightBanner } from "../ItwHighlightBanner";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { GlobalState } from "../../../../../store/reducers/types";

type SizeVariant = React.ComponentProps<typeof ItwHighlightBanner>["size"];

describe("ItwHighlightBanner", () => {
  it.each(["large", "small"])(
    "should match the snapshot for %s variant",
    variant => {
      const dummyHandler = jest.fn();
      const initialState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const mockStore = configureMockStore<GlobalState>();
      const store: ReturnType<typeof mockStore> = mockStore(initialState);

      const component = render(
        <Provider store={store}>
          <ItwHighlightBanner
            size={variant as SizeVariant}
            title="title"
            description="description"
            action="action"
            onPress={dummyHandler}
          />
        </Provider>
      );
      expect(component).toMatchSnapshot();
    }
  );
});
