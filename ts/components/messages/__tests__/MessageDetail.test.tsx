import React from "react";
import configureMockStore from "redux-mock-store";
import I18n from "../../../i18n";
import ROUTES from "../../../navigation/routes";
import { applicationChangeState } from "../../../store/actions/application";
import {
  medicalPrescription,
  paymentValidInvalidAfterDueDate
} from "../../../__mocks__/message";
import { service_1 } from "../../../__mocks__/messages";

import { appReducer } from "../../../store/reducers";
import {
  toUIMessage,
  toUIMessageDetails
} from "../../../store/reducers/entities/messages/transformers";
import { toUIService } from "../../../store/reducers/entities/services/transformers";
import { GlobalState } from "../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../utils/testWrapper";
import MessageDetail from "../MessageDetail";

jest.useFakeTimers();

const add8Days = (dueDate: Date) =>
  new Date(dueDate.getTime() + 1000 * 60 * 60 * 24 * 8);

const defaultProps: React.ComponentProps<typeof MessageDetail> = {
  hasPaidBadge: false,
  message: toUIMessage(medicalPrescription),
  messageDetails: toUIMessageDetails(medicalPrescription),
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

  describe("when a message doesn't contain prescription data but has a due date", () => {
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

  describe("when a message contains prescription data", () => {
    it("should render the medical prescription identifiers", () => {
      const { component } = renderComponent(defaultProps);
      expect(
        component.queryByText(I18n.t("messages.medical.nre"))
      ).not.toBeNull();
      expect(
        component.queryByText(I18n.t("messages.medical.iup"))
      ).not.toBeNull();
      expect(
        component.queryByText(I18n.t("messages.medical.patient_fiscal_code"))
      ).not.toBeNull();
    });

    it("should not render the CTA bar", () => {
      const { component } = renderComponent(defaultProps);
      expect(component.queryByTestId("CtaBar_withCTA")).toBeNull();
      expect(component.queryByTestId("CtaBar_withFooter")).toBeNull();
    });

    it("should render the custom title", () => {
      const { component } = renderComponent(defaultProps);
      expect(
        component.queryByText(I18n.t("messages.medical.prescription"))
      ).not.toBeNull();
      expect(
        component.queryByText(I18n.t("messages.medical.memo"))
      ).not.toBeNull();
    });

    describe("and has a due date more than 7 days in the future with payment data", () => {
      // Please note that medical data can also carry a payment
      const props = {
        ...defaultProps,
        messageDetails: toUIMessageDetails({
          ...medicalPrescription,
          content: {
            ...medicalPrescription.content,
            payment_data: paymentValidInvalidAfterDueDate.content.payment_data,
            due_date: add8Days(new Date())
          }
        })
      };
      it("should render the medical prescription due date", () => {
        const { component } = renderComponent(props);
        expect(
          component.queryByTestId("MedicalPrescriptionDueDate_valid")
        ).not.toBeNull();
      });
    });
  });
});

const renderComponent = (props: React.ComponentProps<typeof MessageDetail>) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(globalState);

  return {
    component: renderScreenFakeNavRedux<GlobalState>(
      () => <MessageDetail {...props} />,
      ROUTES.MESSAGES_HOME,
      {},
      store
    ),
    store
  };
};
