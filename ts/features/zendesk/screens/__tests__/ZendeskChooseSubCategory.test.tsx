import { RenderAPI } from "@testing-library/react-native";
import { createStore, Store } from "redux";
import { ZendeskCategory } from "../../../../../definitions/content/ZendeskCategory";
import { ZendeskSubCategories } from "../../../../../definitions/content/ZendeskSubCategories";
import ROUTES from "../../../../navigation/routes";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import * as zendeskAction from "../../store/actions";
import { zendeskSelectedCategory } from "../../store/actions";
import ZendeskChooseSubCategory from "../ZendeskChooseSubCategory";

jest.useFakeTimers();

const mockedNavigation = jest.fn();
const mockedSetOptions = jest.fn();

jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockedNavigation,
      dispatch: jest.fn(),
      setOptions: mockedSetOptions,
      addListener: () => jest.fn()
    })
  };
});

const mockedCategory: ZendeskCategory = {
  value: "mockedValue",
  description: {
    "it-IT": "mockedDescription",
    "en-EN": "mockedDescription",
    "de-DE": "mockedDescription"
  }
};

const mockedZendeskSubcategories: ZendeskSubCategories = {
  id: "67890",
  subCategories: [
    {
      value: "mockedSubcategoryValue",
      description: {
        "it-IT": "mockedSubcategorydescription",
        "en-EN": "mockedSubcategorydescription",
        "de-DE": "mockedSubcategorydescription"
      }
    }
  ]
};

const mockedCategoryWithSubcategory: ZendeskCategory = {
  value: "mockedValue",
  description: {
    "it-IT": "mockedDescription",
    "en-EN": "mockedDescription",
    "de-DE": "mockedDescription"
  },
  zendeskSubCategories: mockedZendeskSubcategories
};

describe("the ZendeskChooseSubCategory screen", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  const zendeskSupportFailureSpy = jest.spyOn(
    zendeskAction,
    "zendeskSupportFailure"
  );
  const globalState = appReducer(undefined, applicationChangeState("active"));

  describe("should call the zendeskSupportFailure", () => {
    it("if the selectedCategory is undefined", () => {
      const store: Store<GlobalState> = createStore(
        appReducer,
        globalState as any
      );
      renderComponent(store);
      expect(zendeskSupportFailureSpy).toBeCalled();
    });
    it("if the selected category has not sub-categories", () => {
      const store: Store<GlobalState> = createStore(
        appReducer,
        globalState as any
      );
      renderComponent(store);
      store.dispatch(zendeskSelectedCategory(mockedCategory));
      expect(zendeskSupportFailureSpy).toBeCalled();
    });
  });

  describe("if the selected category is defined and has at least a subcategory", () => {
    beforeEach(() => {
      mockedNavigation.mockClear();
    });
    it("should render the subcategory", () => {
      const store: Store<GlobalState> = createStore(
        appReducer,
        globalState as any
      );
      const component: RenderAPI = renderComponent(store);
      store.dispatch(zendeskSelectedCategory(mockedCategoryWithSubcategory));
      expect(
        component.queryByTestId(
          mockedZendeskSubcategories.subCategories[0].value as string
        )
      ).toBeDefined();
    });
  });
});

function renderComponent(store: Store<GlobalState>) {
  return renderScreenWithNavigationStoreContext<GlobalState>(
    ZendeskChooseSubCategory,
    ROUTES.MAIN,
    {},
    store
  );
}
