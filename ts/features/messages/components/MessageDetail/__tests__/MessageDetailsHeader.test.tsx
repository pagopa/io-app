import React, { ComponentProps } from "react";
import { Action, Store } from "redux";
import configureMockStore from "redux-mock-store";
import { MessageDetailsHeader } from "../MessageDetailsHeader";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { loadServiceDetail } from "../../../../../store/actions/services";
import { service_1 } from "../../../__mocks__/messages";
import { reproduceSequence } from "../../../../../utils/tests";

const defaultProps: ComponentProps<typeof MessageDetailsHeader> = {
  createdAt: new Date("2021-10-18T16:00:30.541Z"),
  serviceId: service_1.service_id,
  subject: "#### Subject ####"
};

describe("MessageDetailsHeader component", () => {
  it("should match the snapshot with default props", () => {
    const { component } = renderComponent(defaultProps);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should NOT render the organization info when the serviceId is invalid", () => {
    const { component } = renderComponent({
      ...defaultProps,
      serviceId: "invalid" as ServiceId
    });
    expect(component.queryByText(service_1.organization_name)).toBeNull();
    expect(component.queryByText(service_1.service_name)).toBeNull();
  });
});

const renderComponent = (
  props: React.ComponentProps<typeof MessageDetailsHeader>
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
      "DUMMY_ROUTE",
      {},
      store
    ),
    store
  };
};
