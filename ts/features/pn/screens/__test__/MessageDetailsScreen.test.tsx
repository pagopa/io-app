import { fireEvent } from "@testing-library/react-native";
import { Action, Store } from "redux";
import configureMockStore from "redux-mock-store";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
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
jest.mock("../../../../utils/hooks/bottomSheet");
jest.mock("../../../../navigation/params/AppParamsList");

describe("MessageDetailsScreen", () => {
  const mockDismiss = jest.fn();
  const mockPresent = jest.fn();
  const mockPopToTop = jest.fn();

  (useIOBottomSheetModal as jest.Mock).mockImplementation(({ component }) => ({
    bottomSheet: component,
    present: mockPresent,
    dismiss: mockDismiss
  }));

  (useIONavigation as jest.Mock).mockImplementation(() => ({
    popToTop: mockPopToTop,
    setOptions: jest.fn(),
    goBack: jest.fn()
  }));

  afterEach(() => {
    jest.clearAllMocks();
  });

  [true, false].forEach(isAar => {
    it(`should match the snapshot when there is an error -- aar:${isAar}`, () => {
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

      const { component } = renderComponent(store, isAar);
      expect(component).toMatchSnapshot();
    });

    it(`should match the snapshot when everything went fine -- aar:${isAar}`, () => {
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

      const { component } = renderComponent(store, isAar);
      expect(component).toMatchSnapshot();
    });
  });

  it("calls dismiss() only when primary button is pressed", () => {
    const sequence = [
      loadMessageById.success(toUIMessage(message_1)),
      loadServiceDetail.success(service_1),
      loadMessageDetails.success(toUIMessageDetails(message_1)),
      loadThirdPartyMessage.success({
        id: message_1.id,
        content: { kind: "TPM", ...thirdPartyMessage }
      })
    ];
    const state = reproduceSequence({} as GlobalState, appReducer, sequence);
    const store = configureMockStore<GlobalState>()(state);

    const {
      component: { getByTestId }
    } = renderComponent(store, true);

    const primaryButton = getByTestId("primary_button");
    fireEvent.press(primaryButton);

    expect(mockDismiss).toHaveBeenCalledTimes(1);
    expect(mockPopToTop).not.toHaveBeenCalled();
  });

  it("calls dismiss() and popToTop() when secondary button is pressed", () => {
    const sequence = [
      loadMessageById.success(toUIMessage(message_1)),
      loadServiceDetail.success(service_1),
      loadMessageDetails.success(toUIMessageDetails(message_1)),
      loadThirdPartyMessage.success({
        id: message_1.id,
        content: { kind: "TPM", ...thirdPartyMessage }
      })
    ];
    const state = reproduceSequence({} as GlobalState, appReducer, sequence);
    const store = configureMockStore<GlobalState>()(state);

    const {
      component: { getByTestId }
    } = renderComponent(store, true);

    const secondaryButton = getByTestId("secondary_button");
    fireEvent.press(secondaryButton);

    expect(mockDismiss).toHaveBeenCalledTimes(1);
    expect(mockPopToTop).toHaveBeenCalledTimes(1);
  });
});

const renderComponent = (store: Store<GlobalState>, isAAr = false) => {
  const { id, sender_service_id } = message_1;

  return {
    component: renderScreenWithNavigationStoreContext<GlobalState>(
      MessageDetailsScreen,
      PN_ROUTES.MESSAGE_DETAILS,
      {
        firstTimeOpening: false,
        messageId: id,
        serviceId: sender_service_id,
        isAArMessage: isAAr
      },
      store
    )
  };
};
