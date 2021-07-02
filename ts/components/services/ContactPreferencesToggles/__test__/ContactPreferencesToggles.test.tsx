import React from "react";
import { NavigationParams } from "react-navigation";
import { createStore } from "redux";
import { NotificationChannelEnum } from "../../../../../definitions/backend/NotificationChannel";
import { applicationChangeState } from "../../../../store/actions/application";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../utils/testWrapper";
import { appReducer } from "../../../../store/reducers";
import ROUTES from "../../../../navigation/routes";

import ContactPreferencesToggles from "../index";

jest.useFakeTimers();

describe("ContactPreferencesToggles component", () => {
  describe("when channels are not defined", () => {
    it("should render all the switches", () => {
      const component = renderComponent({});
      expect(
        component.getByTestId("contact-preferences-inbox-switch")
      ).toBeDefined();
      expect(
        component.getByTestId("contact-preferences-webhook-switch")
      ).toBeDefined();
      // expect(
      //   component.getByTestId("contact-preferences-email-switch")
      // ).toBeDefined();
    });
  });

  describe("when channels is an empty array", () => {
    it("should render the INBOX switch", () => {
      const component = renderComponent({ channels: [] });
      expect(
        component.getByTestId("contact-preferences-inbox-switch")
      ).toBeDefined();
    });
    it("should not render WEBHOOK and EMAIL switches", () => {
      const component = renderComponent({ channels: [] });
      expect(
        component.queryByTestId("contact-preferences-webhook-switch")
      ).toBeNull();
      expect(
        component.queryByTestId("contact-preferences-email-switch")
      ).toBeNull();
    });
  });

  describe("when channels contains all the items ", () => {
    it("should render all the switches", () => {
      const component = renderComponent({
        channels: [
          NotificationChannelEnum.EMAIL,
          NotificationChannelEnum.WEBHOOK
        ]
      });
      expect(
        component.getByTestId("contact-preferences-inbox-switch")
      ).toBeDefined();
      expect(
        component.getByTestId("contact-preferences-webhook-switch")
      ).toBeDefined();
      // expect(
      //   component.getByTestId("contact-preferences-email-switch")
      // ).toBeDefined();
    });
  });
});

function renderComponent(options: {
  channels?: ReadonlyArray<NotificationChannelEnum>;
}) {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenFakeNavRedux<GlobalState, NavigationParams>(
    () => <ContactPreferencesToggles {...options} />,
    ROUTES.WALLET_CHECKOUT_3DS_SCREEN,
    {},
    createStore(appReducer, globalState as any)
  );
}
