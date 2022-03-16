import { createStore, Store } from "redux";
import { fireEvent, RenderAPI } from "@testing-library/react-native";
import { ReactTestInstance } from "react-test-renderer";
import { appReducer } from "../../../../store/reducers";
import { applicationChangeState } from "../../../../store/actions/application";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../utils/testWrapper";
import ROUTES from "../../../../navigation/routes";
import * as zendeskAction from "../../store/actions";
import { zendeskSelectedCategory } from "../../store/actions";
import { ZendeskSubCategories } from "../../../../../definitions/content/ZendeskSubCategories";
import { ZendeskCategory } from "../../../../../definitions/content/ZendeskCategory";
import MockZendesk from "../../../../__mocks__/io-react-native-zendesk";
import ZendeskChooseSubCategory from "../ZendeskChooseSubCategory";

jest.useFakeTimers();

const mockedNavigation = jest.fn();

jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockedNavigation,
      dispatch: jest.fn(),
      addListener: () => jest.fn()
    })
  };
});

const mockedCategory: ZendeskCategory = {
  value: "mockedValue",
  description: {
    "it-IT": "mockedDescription",
    "en-EN": "mockedDescription"
  }
};

const mockedZendeskSubcategories: ZendeskSubCategories = {
  id: "67890",
  subCategories: [
    {
      value: "mockedSubcategoryValue",
      description: {
        "it-IT": "mockedSubcategorydescription",
        "en-EN": "mockedSubcategorydescription"
      }
    }
  ]
};

const mockedCategoryWithSubcategory: ZendeskCategory = {
  value: "mockedValue",
  description: {
    "it-IT": "mockedDescription",
    "en-EN": "mockedDescription"
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
    it("should call the addTicketCustomField and the navigateToZendeskAskPermissions functions when is pressed", () => {
      const store: Store<GlobalState> = createStore(
        appReducer,
        globalState as any
      );
      const component: RenderAPI = renderComponent(store);
      store.dispatch(zendeskSelectedCategory(mockedCategoryWithSubcategory));
      const subCategoryItem: ReactTestInstance = component.getByTestId(
        mockedZendeskSubcategories.subCategories[0].value as string
      );
      fireEvent(subCategoryItem, "onPress");
      expect(MockZendesk.addTicketCustomField).toBeCalled();
      expect(mockedNavigation).toHaveBeenCalledWith("ZENDESK_ASK_PERMISSIONS", {
        assistanceForPayment: undefined
      });
    });
  });
});

function renderComponent(store: Store<GlobalState>) {
  return renderScreenFakeNavRedux<GlobalState>(
    ZendeskChooseSubCategory,
    ROUTES.MAIN,
    {},
    store
  );
}
