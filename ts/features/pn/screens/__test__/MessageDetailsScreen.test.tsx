import { Action, Store } from "redux";
import configureMockStore from "redux-mock-store";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { reproduceSequence } from "../../../../utils/tests";
import { message_1 } from "../../../messages/__mocks__/message";
import { service_1 } from "../../../messages/__mocks__/messages";
import {
  loadMessageById,
  loadMessageDetails,
  loadThirdPartyMessage
} from "../../../messages/store/actions";
import {
  toUIMessage,
  toUIMessageDetails
} from "../../../messages/store/reducers/transformers";
import { loadServiceDetail } from "../../../services/details/store/actions/details";
import { thirdPartyMessage } from "../../__mocks__/pnMessage";
import PN_ROUTES from "../../navigation/routes";
import { MessageDetailsScreen } from "../MessageDetailsScreen";

jest.mock("../../components/MessageDetails");

describe("MessageDetailsScreen", () => {
  it("should match the snapshot when there is an error", () => {
    const sequenceOfActions: ReadonlyArray<Action> = [
      applicationChangeState("active")
    ];

    const state: GlobalState = reproduceSequence(
      {} as GlobalState,
      appReducer,
      sequenceOfActions
    );
    const mockStore = configureMockStore<GlobalState>();
    const store: Store<GlobalState> = mockStore(state);

    const { component } = renderComponent(store);
    expect(component).toMatchSnapshot();
  });

  it("should match the snapshot when everything went fine", () => {
    const sequenceOfActions: ReadonlyArray<Action> = [
      applicationChangeState("active"),
      loadMessageById.success(toUIMessage(message_1)),
      loadServiceDetail.success(service_1),
      loadMessageDetails.success(toUIMessageDetails(message_1)),
      loadThirdPartyMessage.success({
        id: message_1.id,
        content: { kind: "TPM", ...thirdPartyMessage }
      })
    ];

    const state: GlobalState = reproduceSequence(
      {} as GlobalState,
      appReducer,
      sequenceOfActions
    );
    const mockStore = configureMockStore<GlobalState>();
    const store: Store<GlobalState> = mockStore(state);

    const { component } = renderComponent(store);
    expect(component).toMatchSnapshot();
  });
});

const renderComponent = (store: Store<GlobalState>) => {
  const { id, sender_service_id } = message_1;

  return {
    component: renderScreenWithNavigationStoreContext<GlobalState>(
      MessageDetailsScreen,
      PN_ROUTES.MESSAGE_DETAILS,
      {
        firstTimeOpening: false,
        messageId: id,
        serviceId: sender_service_id
      },
      store
    )
  };
};
