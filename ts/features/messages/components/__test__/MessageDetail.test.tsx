import React from "react";
import configureMockStore from "redux-mock-store";
import I18n from "../../../../i18n";
import { applicationChangeState } from "../../../../store/actions/application";
import {
  message_1,
  paymentValidInvalidAfterDueDate
} from "../../__mocks__/message";
import { service_1 } from "../../__mocks__/messages";

import { appReducer } from "../../../../store/reducers";
import {
  toUIMessage,
  toUIMessageDetails
} from "../../store/reducers/transformers";
import { toUIService } from "../../../../store/reducers/entities/services/transformers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import MessageDetail from "../MessageDetail";
import { MESSAGES_ROUTES } from "../../navigation/routes";

jest.useFakeTimers();

const add8Days = (dueDate: Date) =>
  new Date(dueDate.getTime() + 1000 * 60 * 60 * 24 * 8);

const defaultProps: React.ComponentProps<typeof MessageDetail> = {
  hasPaidBadge: false,
  message: toUIMessage(message_1),
  messageDetails: toUIMessageDetails(message_1),
  onServiceLinkPress: jest.fn(),
  service: toUIService(service_1),
  serviceMetadata: { phone: "+123333", email: "hola@vpn.com" } as any
};

describe("MessageDetail component", () => {
  describe("when the service is defined", () => {
    it("should render organization info", () => {
      const { component } = renderComponent(defaultProps);
      expect(component.queryByText(service_1.organization_name)).not.toBeNull();
      expect(component.queryByText(service_1.service_name)).not.toBeNull();
    });
  });

  describe("when a message has a due date", () => {
    const props = {
      ...defaultProps,
      messageDetails: toUIMessageDetails({
        ...paymentValidInvalidAfterDueDate,
        content: {
          ...paymentValidInvalidAfterDueDate.content,
          due_date: add8Days(new Date())
        }
      })
    };
    describe("and the `hasPaidBadge` is true", () => {
      it("should show the paid message", () => {
        const { component } = renderComponent({ ...props, hasPaidBadge: true });
        expect(
          component.queryByText(I18n.t("wallet.errors.DUPLICATED"))
        ).not.toBeNull();
      });
    });
    describe("and the `hasPaidBadge` is false", () => {
      it("should not show the paid message", () => {
        const { component } = renderComponent(props);
        expect(
          component.queryByText(I18n.t("wallet.errors.DUPLICATED"))
        ).toBeNull();
      });
    });
  });
});

const renderComponent = (props: React.ComponentProps<typeof MessageDetail>) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(globalState);

  return {
    component: renderScreenWithNavigationStoreContext<GlobalState>(
      () => <MessageDetail {...props} />,
      MESSAGES_ROUTES.MESSAGES_HOME,
      {},
      store
    ),
    store
  };
};
