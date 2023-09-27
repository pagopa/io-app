import React from "react";

import configureMockStore from "redux-mock-store";
import I18n from "../../../../i18n";
import ROUTES from "../../../../navigation/routes";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { paymentValidInvalidAfterDueDate } from "../../../../__mocks__/message";
import { service_1 } from "../../../../__mocks__/messages";

import { toUIMessageDetails } from "../../../../store/reducers/entities/messages/transformers";
import { toUIService } from "../../../../store/reducers/entities/services/transformers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../utils/testWrapper";

import CtaBar from "../common/CtaBar";

jest.useFakeTimers();

const uiMessageDetails = toUIMessageDetails(paymentValidInvalidAfterDueDate);
const uiService = toUIService(service_1);

const defaultProps = {
  isPaid: true,
  messageDetails: uiMessageDetails,
  service: uiService,
  servicesMetadata: undefined
};

describe("the `CtaBar` component", () => {
  describe("when neither `paymentData` nor `dueDate` are defined for the message details", () => {
    it("should match the snapshot (no buttons)", () => {
      const noPaymentMessage = {
        ...uiMessageDetails,
        paymentData: undefined,
        dueDate: undefined
      };
      const { component } = renderComponent({
        ...defaultProps,
        messageDetails: noPaymentMessage
      });
      expect(component.toJSON()).toMatchSnapshot();
    });
  });

  describe("when `paymentData` is defined", () => {
    describe("and `isPaid` is true", () => {
      it("should render the payment button", () => {
        const { component } = renderComponent(defaultProps);
        expect(
          component.queryByText(I18n.t("messages.cta.seeNotice"))
        ).not.toBeNull();
      });
    });
    describe("and `isPaid` is false", () => {
      it("should render the payment button", () => {
        const { component } = renderComponent({
          ...defaultProps,
          isPaid: false
        });
        expect(
          component.queryByText(I18n.t("messages.cta.seeNotice"))
        ).not.toBeNull();
      });
    });
  });

  describe("when `dueDate` is defined", () => {
    describe("and `isPaid` is true", () => {
      it("should not render the calendar button", () => {
        const { component } = renderComponent(defaultProps);
        expect(
          component.queryByText(I18n.t("messages.cta.reminder"))
        ).toBeNull();
      });
    });
    describe("and `isPaid` is false", () => {
      it("should render the calendar button", () => {
        const { component } = renderComponent({
          ...defaultProps,
          messageDetails: {
            ...defaultProps.messageDetails,
            dueDate: new Date(new Date().getTime() + 1000 * 60 * 60 * 24)
          },
          isPaid: false
        });
        expect(
          component.queryByText(I18n.t("messages.cta.reminder"))
        ).not.toBeNull();
      });
    });
    describe("and the payment has expired", () => {
      it("should not render the calendar button", () => {
        const { component } = renderComponent({
          ...defaultProps
        });
        expect(
          component.queryByText(I18n.t("messages.cta.reminder"))
        ).toBeNull();
      });
    });
  });

  describe("when at least one CTA is defined in the markdown", () => {
    const markdown = `---
en:
    cta_1: 
        text: "DON'T PANIC!"
        action: "ioit://PROFILE_MAIN"
---
                      ` as any;

    it("should render it", () => {
      const { component } = renderComponent({
        ...defaultProps,
        messageDetails: {
          ...defaultProps.messageDetails,
          markdown
        }
      });
      expect(component.queryByText("DON'T PANIC!")).not.toBeNull();
    });
  });
});

const renderComponent = (props: React.ComponentProps<typeof CtaBar>) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(globalState);

  return {
    component: renderScreenFakeNavRedux<GlobalState>(
      () => <CtaBar {...props} />,
      ROUTES.MESSAGE_DETAIL,
      {},
      store
    ),
    store
  };
};
