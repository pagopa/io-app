import React, { ComponentProps } from "react";
import { Action, Store } from "redux";
import configureMockStore from "redux-mock-store";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { loadServiceDetail } from "../../../../../store/actions/services";
import { service_1 } from "../../../__mocks__/messages";
import { reproduceSequence } from "../../../../../utils/tests";
import { MessageDetailsFooter } from "../MessageDetailsFooter";
import { ServiceMetadata } from "../../../../../../definitions/backend/ServiceMetadata";

const defaultProps: ComponentProps<typeof MessageDetailsFooter> = {
  serviceId: service_1.service_id
};

describe("MessageDetailsFooter component", () => {
  it("should match the snapshot when the service's contact detail are defined", () => {
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

  it("should match the snapshot when the service's contact detail are not defined", () => {
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
