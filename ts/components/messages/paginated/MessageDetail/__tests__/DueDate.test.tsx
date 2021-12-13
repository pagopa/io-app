import React from "react";
import { render } from "@testing-library/react-native";

import { paymentValidInvalidAfterDueDate } from "../../../../../__mocks__/message";
import { toUIMessageDetails } from "../../../../../store/reducers/entities/messages/transformers";
import { MessagePaymentExpirationInfo } from "../../../../../utils/messages";

import DueDateBar from "../DueDateBar";

jest.useFakeTimers();

const uiMessageDetails = toUIMessageDetails(paymentValidInvalidAfterDueDate);

const expirationInfo: MessagePaymentExpirationInfo = {
  kind: "EXPIRABLE",
  expireStatus: "VALID",
  dueDate: uiMessageDetails.dueDate!
};

const defaultProps: React.ComponentProps<typeof DueDateBar> = {
  dueDate: uiMessageDetails.dueDate!,
  expirationInfo,
  isPaid: false
};

describe("the `DueDateBar` component", () => {
  describe("when `isPaid` is true ", () => {
    it("should match the snapshot", () => {
      const component = renderComponent({
        ...defaultProps,
        isPaid: true
      });
      expect(component.toJSON()).toMatchSnapshot();
    });
  });

  describe("when `isPaid` is false ", () => {
    describe("and `expirationInfo` is EXPIRED ", () => {
      it("should match the snapshot", () => {
        const component = renderComponent({
          ...defaultProps,
          expirationInfo: { ...expirationInfo, expireStatus: "EXPIRED" }
        });
        expect(component.toJSON()).toMatchSnapshot();
      });
    });

    describe("and `expirationInfo` is EXPIRING ", () => {
      it("should match the snapshot", () => {
        const component = renderComponent({
          ...defaultProps,
          expirationInfo: { ...expirationInfo, expireStatus: "EXPIRING" }
        });
        expect(component.toJSON()).toMatchSnapshot();
      });
    });

    describe("and `expirationInfo` is VALID ", () => {
      it("should match the snapshot", () => {
        const component = renderComponent({
          ...defaultProps,
          expirationInfo: { ...expirationInfo, expireStatus: "VALID" }
        });
        expect(component.toJSON()).toMatchSnapshot();
      });
    });
  });
});

const renderComponent = (props: React.ComponentProps<typeof DueDateBar>) =>
  render(<DueDateBar {...props} />);
