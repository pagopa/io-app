import { ComponentProps } from "react";
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
import { ServiceMetadata } from "../../../../../../definitions/services/ServiceMetadata";
import { MESSAGES_ROUTES } from "../../../navigation/routes";

const mockPresentBottomSheet = jest.fn();

jest.mock("../../../../../utils/hooks/bottomSheet", () => ({
  useIOBottomSheetModal: () => ({
    present: mockPresentBottomSheet
  })
}));

const defaultProps: ComponentProps<typeof MessageDetailsFooter> = {
  messageId: messageId_1,
  serviceId: service_1.id
};

const noticeNumber = "111122223333444455";
const payeeFiscalCode = "01234567890";

describe("MessageDetailsFooter component", () => {
  beforeEach(() => {
    mockPresentBottomSheet.mockReset();
  });

  it("should match the snapshot, with service's contact details, no notice number, no payee fiscal code", () => {
    const sequenceOfActions: ReadonlyArray<Action> = [
      applicationChangeState("active"),
      loadServiceDetail.success({
        ...service_1,
        metadata: {
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

  it("should match the snapshot, with service's contact details, with notice number, no payee fiscal code", () => {
    const sequenceOfActions: ReadonlyArray<Action> = [
      applicationChangeState("active"),
      loadServiceDetail.success({
        ...service_1,
        metadata: {
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

    const { component } = renderComponent(state, {
      ...defaultProps,
      noticeNumber
    });
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should match the snapshot, with service's contact details, no notice number, with payee fiscal code", () => {
    const sequenceOfActions: ReadonlyArray<Action> = [
      applicationChangeState("active"),
      loadServiceDetail.success({
        ...service_1,
        metadata: {
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

    const { component } = renderComponent(state, {
      ...defaultProps,
      payeeFiscalCode
    });
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should match the snapshot, with service's contact details, with notice number, with payee fiscal code", () => {
    const sequenceOfActions: ReadonlyArray<Action> = [
      applicationChangeState("active"),
      loadServiceDetail.success({
        ...service_1,
        metadata: {
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

    const { component } = renderComponent(state, {
      ...defaultProps,
      noticeNumber,
      payeeFiscalCode
    });
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should match the snapshot, no service's contact details, no notice number, no payee fiscal code", () => {
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

  it("should match the snapshot, no service's contact details, with notice number, no payee fiscal code", () => {
    const sequenceOfActions: ReadonlyArray<Action> = [
      applicationChangeState("active"),
      loadServiceDetail.success(service_1)
    ];

    const state: GlobalState = reproduceSequence(
      {} as GlobalState,
      appReducer,
      sequenceOfActions
    );

    const { component } = renderComponent(state, {
      ...defaultProps,
      noticeNumber
    });
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should match the snapshot, no service's contact details, no notice number, with payee fiscal code", () => {
    const sequenceOfActions: ReadonlyArray<Action> = [
      applicationChangeState("active"),
      loadServiceDetail.success(service_1)
    ];

    const state: GlobalState = reproduceSequence(
      {} as GlobalState,
      appReducer,
      sequenceOfActions
    );

    const { component } = renderComponent(state, {
      ...defaultProps,
      payeeFiscalCode
    });
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should match the snapshot, no service's contact details, with notice number, with payee fiscal code", () => {
    const sequenceOfActions: ReadonlyArray<Action> = [
      applicationChangeState("active"),
      loadServiceDetail.success(service_1)
    ];

    const state: GlobalState = reproduceSequence(
      {} as GlobalState,
      appReducer,
      sequenceOfActions
    );

    const { component } = renderComponent(state, {
      ...defaultProps,
      noticeNumber,
      payeeFiscalCode
    });
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
        metadata: {
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
  props: ComponentProps<typeof MessageDetailsFooter>
) => {
  const mockStore = configureMockStore<GlobalState>();
  const store: Store<GlobalState> = mockStore(state);

  return {
    component: renderScreenWithNavigationStoreContext<GlobalState>(
      () => <MessageDetailsFooter {...props} />,
      MESSAGES_ROUTES.MESSAGE_DETAIL,
      {},
      store
    ),
    store
  };
};
