import { none } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import React from "react";
import { NavigationParams } from "react-navigation";
import configureMockStore from "redux-mock-store";
import { successLoadMessageDetails } from "../../../../__mocks__/message";
import {
  defaultRequestPayload,
  successLoadNextPageMessagesPayload
} from "../../../../__mocks__/messages";
import I18n from "../../../../i18n";

import ROUTES from "../../../../navigation/routes";
import { applicationChangeState } from "../../../../store/actions/application";
import {
  loadMessageDetails,
  loadPreviousPageMessages,
  reloadAllMessages
} from "../../../../store/actions/messages";
import { navigateToPaginatedMessageDetailScreenAction } from "../../../../store/actions/navigation";
import { appReducer } from "../../../../store/reducers";
import { AllPaginated } from "../../../../store/reducers/entities/messages/allPaginated";
import { DetailsById } from "../../../../store/reducers/entities/messages/detailsById";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../utils/testWrapper";
import MessageRouterScreen from "../MessageRouterScreen";

jest.useFakeTimers();

const mockNavDispatch = jest.fn();

jest.mock("../../../../config", () => ({ euCovidCertificateEnabled: true }));
jest.mock("../../../../utils/hooks/useOnFocus", () => ({
  useNavigationContext: () => ({
    dispatch: mockNavDispatch,
    state: { routeName: "test-route" }
  })
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
    it("should dispatch `reloadPage`", () => {
      const { spyStoreDispatch } = renderComponent(id);
      expect(spyStoreDispatch).toHaveBeenCalledWith(
        reloadAllMessages.request(defaultRequestPayload)
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
    const previousCursor = successLoadNextPageMessagesPayload.messages[0].id;
    const allPaginated = {
      data: pot.some({
        page: successLoadNextPageMessagesPayload.messages,
        previous: previousCursor
      })
    };

    describe("and the desired message is not in the page", () => {
      const id = successLoadMessageDetails.id;

      it("should render the loader", () => {
        const { component } = renderComponent(id, { allPaginated });
        expect(
          component.queryByTestId("LoadingErrorComponentLoading")
        ).not.toBeNull();
      });
      it("should dispatch `loadPreviousPage` with the current cursor", () => {
        const { spyStoreDispatch } = renderComponent(id, { allPaginated });
        expect(spyStoreDispatch).toHaveBeenCalledWith(
          loadPreviousPageMessages.request({
            ...defaultRequestPayload,
            cursor: previousCursor
          })
        );
      });
      it("should dispatch `loadMessageDetails`", () => {
        const { spyStoreDispatch } = renderComponent(id, { allPaginated });
        expect(spyStoreDispatch).toHaveBeenCalledWith(
          loadMessageDetails.request({ id })
        );
      });
      it("should not dispatch any other action", () => {
        const { spyStoreDispatch } = renderComponent(id, { allPaginated });
        expect(spyStoreDispatch).toHaveBeenCalledTimes(2);
      });
    });

    describe("and the desired message is in the page", () => {
      const targetMessage = successLoadNextPageMessagesPayload.messages[0];
      const id = targetMessage.id;

      describe("but doesn't have its details", () => {
        // eslint-disable-next-line sonarjs/no-identical-functions
        it("should render the loader", () => {
          const { component } = renderComponent(id, { allPaginated });
          expect(
            component.queryByTestId("LoadingErrorComponentLoading")
          ).not.toBeNull();
        });
        // eslint-disable-next-line sonarjs/no-identical-functions
        it("should dispatch `loadMessageDetails`", () => {
          const { spyStoreDispatch } = renderComponent(id, { allPaginated });
          expect(spyStoreDispatch).toHaveBeenCalledWith(
            loadMessageDetails.request({ id })
          );
        });
        it("should not dispatch any other action", () => {
          const { spyStoreDispatch } = renderComponent(id, { allPaginated });
          expect(spyStoreDispatch).toHaveBeenCalledTimes(1);
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
            allPaginated,
            detailsById
          });
          expect(mockNavDispatch).toHaveBeenCalledWith(
            navigateToPaginatedMessageDetailScreenAction({
              message: targetMessage
            })
          );
        });

        it("should not dispatch any other action", () => {
          const { spyStoreDispatch } = renderComponent(id, {
            allPaginated,
            detailsById
          });
          expect(spyStoreDispatch).toHaveBeenCalledTimes(0);
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
  allPaginated?: Partial<AllPaginated>;
  detailsById?: DetailsById;
};

const renderComponent = (messageId: string, state: InputState = {}) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const allPaginated = {
    data: pot.none,
    lastRequest: none,
    ...state.allPaginated
  };
  const detailsById = state.detailsById ?? {};

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore({
    ...globalState,
    entities: {
      ...globalState.entities,
      messages: { ...globalState.entities.messages, allPaginated, detailsById }
    }
  } as GlobalState);
  const spyStoreDispatch = spyOn(store, "dispatch");
  const navParams = { messageId } as any;
  const navigation = {
    state: {},
    dispatch: jest.fn(),
    getParam: (key: string) => navParams[key]
  } as any;

  const component = renderScreenFakeNavRedux<GlobalState, NavigationParams>(
    () => (
      <MessageRouterScreen
        navigation={navigation as any}
        theme={"light"}
        screenProps={undefined}
      />
    ),
    ROUTES.MESSAGE_ROUTER,
    { messageId },
    store
  );

  return {
    component,
    store,
    spyStoreDispatch,
    navigation
  };
};
