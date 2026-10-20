import { act } from "@testing-library/react-native";
import { createStore, Store } from "redux";

import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { message_1 } from "../../../messages/__mocks__/message";
import {
  cancelPreviousAttachmentDownload,
  cancelQueuedPaymentUpdates
} from "../../../messages/store/actions";
import { terminateAarFlow } from "../../aar/store/actions";
import { sendAarFlowStates } from "../../aar/utils/stateUtils";
import PN_ROUTES from "../../navigation/routes";
import { MessageDetailsScreenRouteParams } from "../../screens/MessageDetailsScreen";
import {
  cancelPNPaymentStatusTracking,
  startPNPaymentStatusTracking
} from "../../store/actions";
import * as REDUCERS from "../../store/reducers";
import { PNMessage } from "../../store/types/types";
import { SendMessageDetailsScreenContent } from "../SendMessageDetailsScreenContent";

jest.mock("../MessageDetails", () => ({
  MessageDetails: () => {
    const { View } = jest.requireActual("react-native");
    return <View testID="mock-message-details" />;
  }
}));
jest.mock(
  "../../aar/components/SendAarMessageDetailBottomSheetComponent",
  () => ({
    SendAarMessageDetailBottomSheetComponent: () => {
      const { View } = jest.requireActual("react-native");
      return <View testID="mock-aar-bottom-sheet" />;
    }
  })
);

const sendMessage = {
  attachments: [],
  created_at: new Date(2025, 0, 1),
  iun: "A IUN",
  notificationStatusHistory: [],
  recipients: [],
  subject: "A subject"
} as unknown as PNMessage;

const { id: messageId, sender_service_id: serviceId } = message_1;

const inboxParams: MessageDetailsScreenRouteParams = {
  firstTimeOpening: true,
  messageId,
  sendOpeningSource: "message",
  sendUserType: "not_set",
  serviceId
};

const aarParams: MessageDetailsScreenRouteParams = {
  firstTimeOpening: undefined,
  messageId,
  sendOpeningSource: "aar",
  sendUserType: "recipient",
  serviceId
};

type Scenario = {
  name: string;
  params: MessageDetailsScreenRouteParams;
  withAarBottomSheet: boolean;
};

const scenarios: ReadonlyArray<Scenario> = [
  {
    name: "a message opened from IO",
    params: inboxParams,
    withAarBottomSheet: false
  },
  {
    name: "an AAR message",
    params: aarParams,
    withAarBottomSheet: true
  }
];

describe("SendMessageDetailsScreenContent", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each(scenarios)(
    "should show the details of $name",
    ({ params, withAarBottomSheet }) => {
      mockSendMessage(sendMessage);

      const { component } = renderComponent(params, withAarBottomSheet);

      expect(component.getByTestId("mock-message-details")).toBeTruthy();
      expect(component.queryByTestId("send-message-details-error")).toBeNull();
    }
  );

  it.each([false, true])(
    "should show the AAR bottom sheet only when its ref is given (%s)",
    withAarBottomSheet => {
      mockSendMessage(sendMessage);

      const { component } = renderComponent(aarParams, withAarBottomSheet);

      const bottomSheet = component.queryByTestId("mock-aar-bottom-sheet");
      if (withAarBottomSheet) {
        expect(bottomSheet).not.toBeNull();
      } else {
        expect(bottomSheet).toBeNull();
      }
    }
  );

  it.each(scenarios)(
    "should show the error when $name is not available",
    ({ params, withAarBottomSheet }) => {
      mockSendMessage(undefined);

      const { component } = renderComponent(params, withAarBottomSheet);

      expect(component.getByTestId("send-message-details-error")).toBeTruthy();
      expect(component.queryByTestId("mock-message-details")).toBeNull();
      expect(component.queryByTestId("mock-aar-bottom-sheet")).toBeNull();
    }
  );

  it.each(scenarios)(
    "should start the payment status tracking of $name",
    ({ params, withAarBottomSheet }) => {
      mockSendMessage(sendMessage);

      const { dispatchSpy } = renderComponent(params, withAarBottomSheet);

      expect(dispatchSpy).toHaveBeenCalledWith(
        startPNPaymentStatusTracking({
          openingSource: params.sendOpeningSource,
          userType: params.sendUserType,
          messageId
        })
      );
    }
  );

  it.each(scenarios)(
    "should release the resources of $name when closed",
    ({ params, withAarBottomSheet }) => {
      mockSendMessage(sendMessage);
      const { component, dispatchSpy } = renderComponent(
        params,
        withAarBottomSheet
      );
      dispatchSpy.mockClear();

      act(component.unmount);

      expect(dispatchSpy).toHaveBeenCalledWith(
        cancelPreviousAttachmentDownload()
      );
      expect(dispatchSpy).toHaveBeenCalledWith(
        cancelQueuedPaymentUpdates({ messageId })
      );
      expect(dispatchSpy).toHaveBeenCalledWith(
        cancelPNPaymentStatusTracking({ messageId })
      );
      const terminateAarFlowAction = terminateAarFlow({
        messageId,
        currentFlowState: sendAarFlowStates.displayingNotificationData
      });
      if (params.sendOpeningSource === "aar") {
        expect(dispatchSpy).toHaveBeenCalledWith(terminateAarFlowAction);
      } else {
        expect(dispatchSpy).not.toHaveBeenCalledWith(terminateAarFlowAction);
      }
    }
  );
});

const mockSendMessage = (message: PNMessage | undefined) =>
  jest
    .spyOn(REDUCERS, "curriedSendMessageFromIdSelector")
    .mockImplementation(
      () =>
        ((_state: GlobalState) => message) as unknown as ReturnType<
          typeof REDUCERS.curriedSendMessageFromIdSelector
        >
    );

const renderComponent = (
  params: MessageDetailsScreenRouteParams,
  withAarBottomSheet: boolean
) => {
  const store: Store<GlobalState> = createStore(
    appReducer,
    appReducer(undefined, applicationChangeState("active")) as any
  );
  const dispatchSpy = jest.spyOn(store, "dispatch");
  const aarBottomSheetRef = { current: undefined };
  const component = renderScreenWithNavigationStoreContext<GlobalState>(
    () => (
      <SendMessageDetailsScreenContent
        {...params}
        aarBottomSheetRef={withAarBottomSheet ? aarBottomSheetRef : undefined}
      />
    ),
    PN_ROUTES.MESSAGE_DETAILS,
    {},
    store
  );
  return { component, dispatchSpy };
};
