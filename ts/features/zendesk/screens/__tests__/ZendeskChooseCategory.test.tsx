import { NavigationParams } from "react-navigation";
import { createStore, Store } from "redux";
import { fireEvent, RenderAPI } from "@testing-library/react-native";
import { appReducer } from "../../../../store/reducers";
import { applicationChangeState } from "../../../../store/actions/application";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../utils/testWrapper";
import ROUTES from "../../../../navigation/routes";
import * as zendeskAction from "../../store/actions";
import { getZendeskConfig } from "../../store/actions";
import { Zendesk } from "../../../../../definitions/content/Zendesk";
import ZendeskChooseCategory from "../ZendeskChooseCategory";
import { ZendeskCategories } from "../../../../../definitions/content/ZendeskCategories";
import { ZendeskSubCategories } from "../../../../../definitions/content/ZendeskSubCategories";
import { ZendeskCategory } from "../../../../../definitions/content/ZendeskCategory";
import MockZendesk from "../../../../__mocks__/io-react-native-zendesk";
import * as navigationAction from "../../store/actions/navigation";
import * as mixpanel from "../../../../mixpanel";

jest.useFakeTimers();

const mockedZendeskConfig: Zendesk = {
  panicMode: false,
  zendeskCategories: {
    id: "12345",
    categories: [
      {
        value: "mockedValue",
        description: {
          "it-IT": "mockedDescription",
          "en-EN": "mockedDescription"
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
        "en-EN": "mockedSubcategorydescription"
      }
    }
  ]
};

describe("the ZendeskChooseCategory screen", () => {
  const zendeskSupportFailureSpy = jest.spyOn(
    zendeskAction,
    "zendeskSupportFailure"
  );
  const globalState = appReducer(undefined, applicationChangeState("active"));

  describe("should call the zendeskSupportFailure", () => {
    // eslint-disable-next-line functional/no-let
    let store: Store<GlobalState>;
    beforeEach(() => {
      store = createStore(appReducer, globalState as any);
      renderComponent(store);
    });
    it("if the ZendeskConfig is not ready", () => {
      store.dispatch(getZendeskConfig.request());
    });
    it("if there isn't a category id", () => {
      store.dispatch(
        getZendeskConfig.success({
          ...mockedZendeskConfig,
          zendeskCategories: {
            categories: mockedZendeskConfig?.zendeskCategories?.categories
          } as ZendeskCategories
        })
      );
    });
    it("if there isn't at least a category", () => {
      store.dispatch(
        getZendeskConfig.success({
          panicMode: mockedZendeskConfig.panicMode
        })
      );
    });
    afterAll(() => {
      expect(zendeskSupportFailureSpy).toBeCalled();
    });
  });

  describe("if the Zendesk config is ready and there is at least a category", () => {
    // eslint-disable-next-line functional/no-let
    let store: Store<GlobalState>;
    // eslint-disable-next-line functional/no-let
    let component: RenderAPI;
    beforeEach(() => {
      store = createStore(appReducer, globalState as any);
      component = renderComponent(store);
    });
    it("should render the received categories", () => {
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

    it("should call the addTicketCustomField and the navigateToZendeskChooseSubCategory functions when press the category if it has sub-categories", () => {
      const navigateToZendeskChooseSubCategorySpy = jest.spyOn(
        navigationAction,
        "navigateToZendeskChooseSubCategory"
      );
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
      const categoryItem = component.getByTestId(
        mockedZendeskConfig.zendeskCategories?.categories[0].value as string
      );
      fireEvent(categoryItem, "onPress");
      expect(MockZendesk.addTicketCustomField).toBeCalled();
      expect(navigateToZendeskChooseSubCategorySpy).toBeCalled();
    });
    it("should call the openSupportTicket, the mixpanelTrack and the zendeskWorkunitCompleted functions when press the category if it has not sub-categories", () => {
      const mixpanelTrackSpy = jest.spyOn(mixpanel, "mixpanelTrack");
      const zendeskWorkunitCompletedSpy = jest.spyOn(
        zendeskAction,
        "zendeskSupportCompleted"
      );
      store.dispatch(getZendeskConfig.success(mockedZendeskConfig));
      const categoryItem = component.getByTestId(
        mockedZendeskConfig.zendeskCategories?.categories[0].value as string
      );
      fireEvent(categoryItem, "onPress");
      expect(MockZendesk.openTicket).toBeCalled();
      expect(mixpanelTrackSpy).toBeCalled();
      expect(zendeskWorkunitCompletedSpy).toBeCalled();
    });
  });
});

function renderComponent(store: Store<GlobalState>) {
  return renderScreenFakeNavRedux<GlobalState, NavigationParams>(
    ZendeskChooseCategory,
    ROUTES.MAIN,
    {},
    store
  );
}
