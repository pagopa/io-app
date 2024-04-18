import React, { ComponentProps } from "react";
import { Action, Store } from "redux";
import configureMockStore from "redux-mock-store";
import { fireEvent } from "@testing-library/react-native";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { loadServiceDetail } from "../../../../services/details/store/actions/details";
import { messageId_1, service_1 } from "../../../__mocks__/messages";
import { reproduceSequence } from "../../../../../utils/tests";
import { MessageDetailsFooter } from "../MessageDetailsFooter";
import { ServiceMetadata } from "../../../../../../definitions/backend/ServiceMetadata";

const mockPresentBottomSheet = jest.fn();

jest.mock("../../../../../utils/hooks/bottomSheet", () => ({
  useIOBottomSheetAutoresizableModal: () => ({
    present: mockPresentBottomSheet
  })
}));

const defaultProps: ComponentProps<typeof MessageDetailsFooter> = {
  messageId: messageId_1,
  serviceId: service_1.service_id
};

describe("MessageDetailsFooter component", () => {
  beforeEach(() => {
    mockPresentBottomSheet.mockReset();
  });

  it("should match the snapshot when the service's contact details are defined", () => {
    const sequenceOfActions: ReadonlyArray<Action> = [
      applicationChangeState("active"),
      loadServiceDetail.success({
        ...service_1,
        service_metadata: {
          email: "test@test.com",
          phone: "+393331234567"
        } as ServiceMetadata
      })
    ];

    const state: GlobalState = reproduceSequence(
      {} as GlobalState,
      appReducer,
      sequenceOfActions
    );

    const { component } = renderComponent(state, defaultProps);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should match the snapshot when the service's contact details are not defined", () => {
    const sequenceOfActions: ReadonlyArray<Action> = [
      applicationChangeState("active"),
      loadServiceDetail.success(service_1)
    ];

    const state: GlobalState = reproduceSequence(
      {} as GlobalState,
      appReducer,
      sequenceOfActions
    );

    const { component } = renderComponent(state, defaultProps);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should call present function when the 'Show more data' action is pressed", () => {
    const sequenceOfActions: ReadonlyArray<Action> = [
      applicationChangeState("active"),
      loadServiceDetail.success(service_1)
    ];

    const state: GlobalState = reproduceSequence(
      {} as GlobalState,
      appReducer,
      sequenceOfActions
    );

    const { component } = renderComponent(state, defaultProps);

    const showMoreDataAction = component.getByTestId("show-more-data-action");
    fireEvent.press(showMoreDataAction);
    expect(mockPresentBottomSheet).toBeCalledTimes(1);
  });

  it("should call present function when the 'Contacts' action is pressed", () => {
    const sequenceOfActions: ReadonlyArray<Action> = [
      applicationChangeState("active"),
      loadServiceDetail.success({
        ...service_1,
        service_metadata: {
          email: "test@test.com",
          phone: "+393331234567"
        } as ServiceMetadata
      })
    ];

    const state: GlobalState = reproduceSequence(
      {} as GlobalState,
      appReducer,
      sequenceOfActions
    );

    const { component } = renderComponent(state, defaultProps);

    const contactsAction = component.getByTestId("contacts-action");
    fireEvent.press(contactsAction);
    expect(mockPresentBottomSheet).toBeCalledTimes(1);
  });
});

const renderComponent = (
  state: GlobalState,
  props: React.ComponentProps<typeof MessageDetailsFooter>
) => {
  const mockStore = configureMockStore<GlobalState>();
  const store: Store<GlobalState> = mockStore(state);

  return {
    component: renderScreenWithNavigationStoreContext<GlobalState>(
      () => <MessageDetailsFooter {...props} />,
      "DUMMY_ROUTE",
      {},
      store
    ),
    store
  };
};
