import React from "react";
import configureMockStore from "redux-mock-store";

import ROUTES from "../../../../navigation/routes";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { toUIMessageDetails } from "../../../../store/reducers/entities/messages/transformers";
import { GlobalState } from "../../../../store/reducers/types";
import { MessagePaymentExpirationInfo } from "../../../../utils/messages";
import { renderScreenFakeNavRedux } from "../../../../utils/testWrapper";
import { paymentValidInvalidAfterDueDate } from "../../../../__mocks__/message";
import MedicalPrescriptionDueDateBar from "../MedicalPrescriptionDueDateBar";

jest.useFakeTimers();

const uiMessageDetails = toUIMessageDetails(paymentValidInvalidAfterDueDate);
const dueDate = uiMessageDetails.dueDate!; // new Date("2021-11-17T12:32:14.497Z");
const defaultProps: React.ComponentProps<typeof MedicalPrescriptionDueDateBar> =
  {
    dueDate,
    messageDetails: uiMessageDetails,
    paymentExpirationInfo: {
      kind: "EXPIRABLE",
      expireStatus: "EXPIRED",
      dueDate
    }
  };

describe("MedicalPrescriptionDueDateBar component", () => {
  describe("when payment info is expired", () => {
    it("should match the snapshot", () => {
      expect(
        renderComponent(defaultProps).component.toJSON()
      ).toMatchSnapshot();
    });
  });

  describe("when payment info is expiring", () => {
    it("should match the snapshot", () => {
      expect(
        renderComponent({
          ...defaultProps,
          paymentExpirationInfo: {
            ...defaultProps.paymentExpirationInfo,
            expireStatus: "EXPIRING"
          } as MessagePaymentExpirationInfo
        }).component.toJSON()
      ).toMatchSnapshot();
    });
  });

  describe("when payment info is valid", () => {
    it("should match the snapshot", () => {
      expect(
        renderComponent({
          ...defaultProps,
          paymentExpirationInfo: {
            ...defaultProps.paymentExpirationInfo,
            expireStatus: "VALID"
          } as MessagePaymentExpirationInfo
        }).component.toJSON()
      ).toMatchSnapshot();
    });
  });

  describe("when payment info is not expirable", () => {
    it("should match the snapshot", () => {
      expect(
        renderComponent({
          ...defaultProps,
          paymentExpirationInfo: {
            kind: "UNEXPIRABLE"
          }
        }).component.toJSON()
      ).toMatchSnapshot();
    });
  });
});

const renderComponent = (
  props: React.ComponentProps<typeof MedicalPrescriptionDueDateBar>
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(globalState);

  return {
    component: renderScreenFakeNavRedux<GlobalState>(
      () => <MedicalPrescriptionDueDateBar {...props} />,
      ROUTES.MESSAGE_DETAIL_PAGINATED,
      {},
      store
    ),
    store
  };
};
