import * as pot from "italia-ts-commons/lib/pot";
import configureMockStore from "redux-mock-store";
import { successLoadMessageDetails } from "../../../../__mocks__/message";
import { successLoadNextPageMessagesPayload } from "../../../../__mocks__/messages";
import I18n from "../../../../i18n";

import ROUTES from "../../../../navigation/routes";
import { applicationChangeState } from "../../../../store/actions/application";
import {
  loadMessageById,
  loadMessageDetails,
  upsertMessageStatusAttributes
} from "../../../../store/actions/messages";
import { navigateToPaginatedMessageDetailScreenAction } from "../../../../store/actions/navigation";
import { loadServiceDetail } from "../../../../store/actions/services";
import { appReducer } from "../../../../store/reducers";
import { DetailsById } from "../../../../store/reducers/entities/messages/detailsById";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import MessageRouterScreen from "../MessageRouterScreen";
import { PaginatedById } from "../../../../store/reducers/entities/messages/paginatedById";

jest.useFakeTimers();

const mockNavDispatch = jest.fn();

jest.mock("../../../../config", () => ({
  euCovidCertificateEnabled: true,
  pageSize: 8,
  maximumItemsFromAPI: 8
}));

jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      dispatch: mockNavDispatch,
      addListener: () => jest.fn()
    })
  };
});

jest.mock("../../../../navigation/NavigationService", () => ({
  dispatchNavigationAction: jest.fn(),
  setNavigationReady: jest.fn(),
  navigationRef: {
    current: jest.fn()
  }
}));

describe("MessageRouterScreen", () => {
  beforeEach(() => {
    mockNavDispatch.mockReset();
  });

  describe("at a cold start, with an empty messages state", () => {
    const id = successLoadMessageDetails.id;
    it("should render the loader", () => {
      const { component } = renderComponent(id);
      expect(
        component.queryByTestId("LoadingErrorComponentLoading")
      ).not.toBeNull();
    });
    it("should dispatch `loadMessageById`", () => {
      const { spyStoreDispatch } = renderComponent(id);
      expect(spyStoreDispatch).toHaveBeenCalledWith(
        loadMessageById.request({ id })
      );
    });
    it("should dispatch `loadMessageDetails`", () => {
      const { spyStoreDispatch } = renderComponent(id);
      expect(spyStoreDispatch).toHaveBeenCalledWith(
        loadMessageDetails.request({ id })
      );
    });
    it("should not dispatch any other action", () => {
      const { spyStoreDispatch } = renderComponent(id);
      expect(spyStoreDispatch).toHaveBeenCalledTimes(2);
    });
  });

  describe("when is already running, with a populated messages state", () => {
    const serviceId = successLoadNextPageMessagesPayload.messages[0].serviceId;
    const paginatedById = successLoadNextPageMessagesPayload.messages.reduce(
      (acc, message) => ({ ...acc, [message.id]: pot.some(message) }),
      {}
    );

    describe("and the desired message is not in the store", () => {
      const id = successLoadMessageDetails.id;

      it("should render the loader", () => {
        const { component } = renderComponent(id, { paginatedById });
        expect(
          component.queryByTestId("LoadingErrorComponentLoading")
        ).not.toBeNull();
      });
      it("should dispatch `loadMessageById`", () => {
        const { spyStoreDispatch } = renderComponent(id, { paginatedById });
        expect(spyStoreDispatch).toHaveBeenCalledWith(
          loadMessageById.request({ id })
        );
      });
      it("should dispatch `loadMessageDetails`", () => {
        const { spyStoreDispatch } = renderComponent(id, { paginatedById });
        expect(spyStoreDispatch).toHaveBeenCalledWith(
          loadMessageDetails.request({ id })
        );
      });
      it("should not dispatch any other action", () => {
        const { spyStoreDispatch } = renderComponent(id, { paginatedById });
        expect(spyStoreDispatch).toHaveBeenCalledTimes(2);
      });
    });

    describe("and the desired message is in the store", () => {
      const targetMessage = successLoadNextPageMessagesPayload.messages[0];
      const id = targetMessage.id;

      describe("but doesn't have its details", () => {
        // eslint-disable-next-line sonarjs/no-identical-functions
        it("should render the loader", () => {
          const { component } = renderComponent(id, { paginatedById });
          expect(
            component.queryByTestId("LoadingErrorComponentLoading")
          ).not.toBeNull();
        });
        // eslint-disable-next-line sonarjs/no-identical-functions
        it("should dispatch `loadMessageDetails`", () => {
          const { spyStoreDispatch } = renderComponent(id, { paginatedById });
          expect(spyStoreDispatch).toHaveBeenCalledWith(
            loadMessageDetails.request({ id })
          );
        });
        it("should dispatch `loadServiceDetail`", () => {
          const { spyStoreDispatch } = renderComponent(id, { paginatedById });
          expect(spyStoreDispatch).toHaveBeenCalledWith(
            loadServiceDetail.request(serviceId)
          );
        });
        it("should not dispatch any other action", () => {
          const { spyStoreDispatch } = renderComponent(id, { paginatedById });
          expect(spyStoreDispatch).toHaveBeenCalledTimes(2);
        });
      });

      describe(`and the details are present in the store`, () => {
        const targetMessageDetails = {
          ...successLoadMessageDetails,
          id
        };
        const detailsById: DetailsById = {
          [id]: pot.some(targetMessageDetails)
        };

        it("should navigate to the MessageDetail screen", () => {
          renderComponent(id, {
            paginatedById,
            detailsById
          });
          expect(mockNavDispatch).toHaveBeenCalledWith(
            navigateToPaginatedMessageDetailScreenAction({
              messageId: targetMessage.id,
              serviceId: targetMessage.serviceId
            })
          );
        });
        // eslint-disable-next-line sonarjs/no-identical-functions
        it("should dispatch `loadServiceDetail`", () => {
          const { spyStoreDispatch } = renderComponent(id, { paginatedById });
          expect(spyStoreDispatch).toHaveBeenCalledWith(
            loadServiceDetail.request(serviceId)
          );
        });
        it("should dispatch `loadServiceDetail`", () => {
          const { spyStoreDispatch } = renderComponent(id, { paginatedById });
          expect(spyStoreDispatch).toHaveBeenCalledWith(
            loadServiceDetail.request(serviceId)
          );
        });
        it("should dispatch read state upsert", () => {
          const { spyStoreDispatch } = renderComponent(id, {
            paginatedById,
            detailsById
          });
          expect(spyStoreDispatch).toHaveBeenCalledWith(
            upsertMessageStatusAttributes.request({
              message: targetMessage,
              update: { tag: "reading" }
            })
          );
        });
        it("should not dispatch any other action", () => {
          const { spyStoreDispatch } = renderComponent(id, { paginatedById });
          expect(spyStoreDispatch).toHaveBeenCalledTimes(2);
        });
      });
    });
  });

  describe("when is the message details is in Error state", () => {
    it("should render the generic error message", () => {
      const errorMessage = "don't you have bigger fish to fry?";
      const { component } = renderComponent("01", {
        detailsById: { "01": pot.noneError(errorMessage) }
      });
      expect(
        component.queryByTestId("LoadingErrorComponentError")
      ).not.toBeNull();
      expect(
        component.queryByText(I18n.t("global.genericError"))
      ).not.toBeNull();
      expect(component.queryByText(errorMessage)).toBeNull();
    });
  });
});

type InputState = {
  paginatedById?: PaginatedById;
  detailsById?: DetailsById;
};

const renderComponent = (messageId: string, state: InputState = {}) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const paginatedById = state.paginatedById ?? {};
  const detailsById = state.detailsById ?? {};

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore({
    ...globalState,
    entities: {
      ...globalState.entities,
      messages: { ...globalState.entities.messages, paginatedById, detailsById }
    }
  } as GlobalState);
  const spyStoreDispatch = spyOn(store, "dispatch");

  const component = renderScreenWithNavigationStoreContext(
    MessageRouterScreen,
    ROUTES.MESSAGE_ROUTER,
    { messageId, fromNotification: false },
    store
  );

  return {
    component,
    store,
    spyStoreDispatch
  };
};
