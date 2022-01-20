import { NavigationParams } from "react-navigation";
import { createStore, Store } from "redux";
import { fireEvent, RenderAPI } from "@testing-library/react-native";
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
import * as mixpanel from "../../../../mixpanel";
import ZendeskChooseSubCategory from "../ZendeskChooseSubCategory";

jest.useFakeTimers();

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
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    it("if the selectedCategory is undefined", () => {});
    it("if the selected category has not sub-categories", () => {
      store.dispatch(zendeskSelectedCategory(mockedCategory));
    });
    afterAll(() => {
      expect(zendeskSupportFailureSpy).toBeCalled();
    });
  });

  describe("if the selected category is defined and has at least a subcategory", () => {
    // eslint-disable-next-line functional/no-let
    let store: Store<GlobalState>;
    // eslint-disable-next-line functional/no-let
    let component: RenderAPI;
    beforeEach(() => {
      store = createStore(appReducer, globalState as any);
      component = renderComponent(store);
      store.dispatch(zendeskSelectedCategory(mockedCategoryWithSubcategory));
    });
    it("should render the subcategory", () => {
      expect(
        component.queryByTestId(
          mockedZendeskSubcategories.subCategories[0].value as string
        )
      ).toBeDefined();
    });
    it("should call the addTicketCustomField, the openSupportTicket, the mixpanelTrack and the zendeskWorkunitComplete functions when is pressed", () => {
      const mixpanelTrackSpy = jest.spyOn(mixpanel, "mixpanelTrack");
      const zendeskWorkunitCompletedSpy = jest.spyOn(
        zendeskAction,
        "zendeskSupportCompleted"
      );
      const subCategoryItem = component.getByTestId(
        mockedZendeskSubcategories.subCategories[0].value as string
      );
      fireEvent(subCategoryItem, "onPress");
      expect(MockZendesk.addTicketCustomField).toBeCalled();
      expect(MockZendesk.openTicket).toBeCalled();
      expect(mixpanelTrackSpy).toBeCalled();
      expect(zendeskWorkunitCompletedSpy).toBeCalled();
    });
  });
});

function renderComponent(store: Store<GlobalState>) {
  return renderScreenFakeNavRedux<GlobalState, NavigationParams>(
    ZendeskChooseSubCategory,
    ROUTES.MAIN,
    {},
    store
  );
}
