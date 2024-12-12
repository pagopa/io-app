import { RenderAPI } from "@testing-library/react-native";
import { createStore, Store } from "redux";
import { Zendesk } from "../../../../../definitions/content/Zendesk";
import { ZendeskCategories } from "../../../../../definitions/content/ZendeskCategories";
import { ZendeskCategory } from "../../../../../definitions/content/ZendeskCategory";
import { ZendeskSubCategories } from "../../../../../definitions/content/ZendeskSubCategories";
import ROUTES from "../../../../navigation/routes";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import * as zendeskAction from "../../store/actions";
import { getZendeskConfig } from "../../store/actions";
import ZendeskChooseCategory from "../ZendeskChooseCategory";

jest.useFakeTimers();

const mockedNavigation = jest.fn();
const mockedSetOptions = jest.fn();

jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      addListener: () => jest.fn(),
      navigate: mockedNavigation,
      dispatch: jest.fn(),
      setOptions: mockedSetOptions
    })
  };
});

const mockedZendeskConfig: Zendesk = {
  panicMode: false,
  zendeskCategories: {
    id: "12345",
    categories: [
      {
        value: "mockedValue",
        description: {
          "it-IT": "mockedDescription",
          "en-EN": "mockedDescription",
          "de-DE": "mockedDescription"
        }
      }
    ]
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

describe("the ZendeskChooseCategory screen", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  const zendeskSupportFailureSpy = jest.spyOn(
    zendeskAction,
    "zendeskSupportFailure"
  );
  const globalState = appReducer(undefined, applicationChangeState("active"));

  describe("should call the zendeskSupportFailure", () => {
    it("if the ZendeskConfig is not ready", () => {
      const store: Store<GlobalState> = createStore(
        appReducer,
        globalState as any
      );
      renderComponent(store);
      store.dispatch(getZendeskConfig.request());
      expect(zendeskSupportFailureSpy).toBeCalled();
    });
    it("if there isn't a category id", () => {
      const store: Store<GlobalState> = createStore(
        appReducer,
        globalState as any
      );
      renderComponent(store);
      store.dispatch(
        getZendeskConfig.success({
          ...mockedZendeskConfig,
          zendeskCategories: {
            categories: mockedZendeskConfig?.zendeskCategories?.categories
          } as ZendeskCategories
        })
      );
      expect(zendeskSupportFailureSpy).toBeCalled();
    });
    it("if there isn't at least a category", () => {
      const store: Store<GlobalState> = createStore(
        appReducer,
        globalState as any
      );
      renderComponent(store);
      store.dispatch(
        getZendeskConfig.success({
          panicMode: mockedZendeskConfig.panicMode
        })
      );
      expect(zendeskSupportFailureSpy).toBeCalled();
    });
  });

  describe("if the Zendesk config is ready and there is at least a category", () => {
    beforeEach(() => {
      mockedNavigation.mockClear();
    });
    it("should render the received categories", () => {
      const store: Store<GlobalState> = createStore(
        appReducer,
        globalState as any
      );
      const component: RenderAPI = renderComponent(store);
      store.dispatch(
        getZendeskConfig.success({
          ...mockedZendeskConfig,
          zendeskCategories: {
            ...mockedZendeskConfig.zendeskCategories,
            categories: [
              {
                ...mockedZendeskConfig.zendeskCategories?.categories[0],
                zendeskSubCategories: mockedZendeskSubcategories
              } as ZendeskCategory
            ]
          } as ZendeskCategories
        })
      );

      expect(
        component.queryByTestId(
          mockedZendeskConfig.zendeskCategories?.categories[0].value as string
        )
      ).toBeDefined();
      expect(
        component.queryByTestId(
          mockedZendeskSubcategories.subCategories[0].value as string
        )
      ).toBeNull();
    });
  });
});

function renderComponent(store: Store<GlobalState>) {
  return renderScreenWithNavigationStoreContext<GlobalState>(
    ZendeskChooseCategory,
    ROUTES.MAIN,
    {},
    store
  );
}
