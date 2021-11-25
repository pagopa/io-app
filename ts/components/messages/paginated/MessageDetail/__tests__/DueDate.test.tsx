import React from "react";
import configureMockStore from "redux-mock-store";
import { NavigationParams } from "react-navigation";
import {} from "@testing-library/react-native";

import { toUIMessageDetails } from "../../../../../store/reducers/entities/messages/transformers";
import { paymentValidInvalidAfterDueDate } from "../../../../../__mocks__/message";
import { MessagePaymentExpirationInfo } from "../../../../../utils/messages";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../../utils/testWrapper";
import ROUTES from "../../../../../navigation/routes";

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
  isPaid: false,
  onGoToWallet: jest.fn()
};

describe("the `DueDateBar` component", () => {
  describe("when `isPaid` is true ", () => {
    it("should match the snapshot", () => {
      const { component } = renderComponent({
        ...defaultProps,
        isPaid: true
      });
      expect(component.toJSON()).toMatchSnapshot();
    });
  });

  describe("when `isPaid` is false ", () => {
    describe("and `expirationInfo` is EXPIRED ", () => {
      it("should match the snapshot", () => {
        const { component } = renderComponent({
          ...defaultProps,
          expirationInfo: { ...expirationInfo, expireStatus: "EXPIRED" }
        });
        expect(component.toJSON()).toMatchSnapshot();
      });
    });

    describe("and `expirationInfo` is EXPIRING ", () => {
      it("should match the snapshot", () => {
        const { component } = renderComponent({
          ...defaultProps,
          expirationInfo: { ...expirationInfo, expireStatus: "EXPIRING" }
        });
        expect(component.toJSON()).toMatchSnapshot();
      });
    });

    describe("and `expirationInfo` is VALID ", () => {
      it("should match the snapshot", () => {
        const { component } = renderComponent({
          ...defaultProps,
          expirationInfo: { ...expirationInfo, expireStatus: "VALID" }
        });
        expect(component.toJSON()).toMatchSnapshot();
      });
    });
  });
});

const renderComponent = (props: React.ComponentProps<typeof DueDateBar>) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(globalState);

  return {
    component: renderScreenFakeNavRedux<GlobalState, NavigationParams>(
      () => <DueDateBar {...props} />,
      ROUTES.MESSAGE_DETAIL,
      {},
      store
    ),
    store
  };
};
