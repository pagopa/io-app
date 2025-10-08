import { ComponentProps } from "react";

import { Action, Store } from "redux";
import configureMockStore from "redux-mock-store";
import { MessageDetailsHeader } from "../MessageDetailsHeader";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { loadServiceDetail } from "../../../../services/details/store/actions/details";
import { service_1 } from "../../../__mocks__/messages";
import { reproduceSequence } from "../../../../../utils/tests";
import { MESSAGES_ROUTES } from "../../../navigation/routes";

const defaultProps: ComponentProps<typeof MessageDetailsHeader> = {
  createdAt: new Date("2021-10-18T16:00:30.541Z"),
  messageId: "01J3DE93YA7QYAD9WZQZCP98M6",
  serviceId: service_1.id,
  subject: "#### Subject ####"
};

describe("MessageDetailsHeader component", () => {
  it("should match the snapshot with default props", () => {
    const { component } = renderComponent(defaultProps);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match the snapshot with a valid thirdPartySenderDenomination", () => {
    const { component } = renderComponent({
      ...defaultProps,
      thirdPartySenderDenomination: "DENOMINATION"
    });
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should NOT render the organization info when the serviceId is invalid", () => {
    const { component } = renderComponent({
      ...defaultProps,
      serviceId: "invalid" as ServiceId
    });
    expect(component.queryByText(service_1.organization.name)).toBeNull();
    expect(component.queryByText(service_1.name)).toBeNull();
  });
});

const renderComponent = (
  props: ComponentProps<typeof MessageDetailsHeader>
) => {
  const sequenceOfActions: ReadonlyArray<Action> = [
    applicationChangeState("active"),
    loadServiceDetail.success(service_1)
  ];

  const state: GlobalState = reproduceSequence(
    {} as GlobalState,
    appReducer,
    sequenceOfActions
  );
  const mockStore = configureMockStore<GlobalState>();
  const store: Store<GlobalState> = mockStore(state);

  return {
    component: renderScreenWithNavigationStoreContext<GlobalState>(
      () => <MessageDetailsHeader {...props} />,
      MESSAGES_ROUTES.MESSAGE_DETAIL,
      {},
      store
    ),
    store
  };
};
