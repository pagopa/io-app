import React from "react";
import { Store } from "redux";
import configureMockStore from "redux-mock-store";
import { NotificationChannelEnum } from "../../../../../definitions/backend/NotificationChannel";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import I18n from "../../../../i18n";
import { applicationChangeState } from "../../../../store/actions/application";
import { loadServicePreference } from "../../../../store/actions/services/servicePreference";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { ServicePreferenceResponse } from "../../../../types/services/ServicePreferenceResponse";
import { renderScreenFakeNavRedux } from "../../../../utils/testWrapper";
import ContactPreferencesToggles from "../index";

jest.useFakeTimers();

describe("ContactPreferencesToggles component", () => {
  it("should render the section header", () => {
    const store = mockState({
      id: "some_id" as ServiceId,
      kind: "success",
      value: {
        inbox: true,
        email: true,
        push: false,
        can_access_message_read_status: false,
        settings_version: 0
      }
    });
    const component = renderComponent(store, {});
    expect(
      component.getByText(I18n.t("serviceDetail.contacts.title"))
    ).toBeDefined();
  });
  describe("when channels are not defined", () => {
    it("should render all the switches", () => {
      const store = mockState({
        id: "some_id" as ServiceId,
        kind: "success",
        value: {
          inbox: true,
          email: true,
          push: false,
          can_access_message_read_status: false,
          settings_version: 0
        }
      });
      const component = renderComponent(store, {});
      expect(
        component.getByTestId("contact-preferences-inbox-switch")
      ).toBeDefined();
      expect(
        component.getByTestId("contact-preferences-webhook-switch")
      ).toBeDefined();
      // TODO this option should be reintegrated once option will supported back from backend https://pagopa.atlassian.net/browse/IARS-17
      // expect(
      //   component.getByTestId("contact-preferences-email-switch")
      // ).toBeDefined();
    });
  });

  describe("when channels is an empty array", () => {
    it("should render the INBOX switch", () => {
      const store = mockState({
        id: "some_id" as ServiceId,
        kind: "success",
        value: {
          inbox: true,
          email: true,
          push: false,
          can_access_message_read_status: false,
          settings_version: 0
        }
      });
      const component = renderComponent(store, { channels: [] });
      expect(
        component.getByTestId("contact-preferences-inbox-switch")
      ).toBeDefined();
    });
    it("should not render WEBHOOK and EMAIL switches", () => {
      const store = mockState({
        id: "some_id" as ServiceId,
        kind: "success",
        value: {
          inbox: true,
          email: true,
          push: false,
          can_access_message_read_status: false,
          settings_version: 0
        }
      });
      const component = renderComponent(store, { channels: [] });
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
      const store = mockState({
        id: "some_id" as ServiceId,
        kind: "success",
        value: {
          inbox: true,
          email: true,
          push: false,
          can_access_message_read_status: false,
          settings_version: 0
        }
      });
      const component = renderComponent(store, {
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
      // TODO this option should be reintegrated once option will supported back from backend https://pagopa.atlassian.net/browse/IARS-17
      // expect(
      //   component.getByTestId("contact-preferences-email-switch")
      // ).toBeDefined();
    });
  });

  describe("when channels are loading", () => {
    it("should render activity indicator on inbox", () => {
      const initialState = appReducer(
        undefined,
        loadServicePreference.success({
          id: "some_id" as ServiceId,
          kind: "success",
          value: {
            inbox: true,
            email: true,
            push: true,
            can_access_message_read_status: false,
            settings_version: 0
          }
        })
      );
      // the store will be in someLoading
      const state = appReducer(
        initialState,
        loadServicePreference.request("aServiceID" as ServiceId)
      );
      const mockStore = configureMockStore<GlobalState>();
      const store = mockStore({
        ...state
      } as GlobalState);
      const component = renderComponent(store, {
        channels: [
          NotificationChannelEnum.EMAIL,
          NotificationChannelEnum.WEBHOOK
        ]
      });
      expect(
        component.getByTestId("contact-preferences-inbox-switch-loading")
      ).toBeDefined();
      expect(
        component.getByTestId("contact-preferences-webhook-switch-loading")
      ).toBeDefined();
    });

    it("should render activity indicator on inbox and webhook", () => {
      const initialState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const state = appReducer(
        initialState,
        loadServicePreference.request("aServiceID" as ServiceId)
      );
      const mockStore = configureMockStore<GlobalState>();
      const store = mockStore({
        ...state
      } as GlobalState);
      const component = renderComponent(store, {
        channels: [
          NotificationChannelEnum.EMAIL,
          NotificationChannelEnum.WEBHOOK
        ]
      });
      expect(
        component.getByTestId("contact-preferences-inbox-switch-loading")
      ).toBeDefined();
    });
  });
});

const mockState = (servicePreference: ServicePreferenceResponse) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const state = appReducer(
    initialState,
    loadServicePreference.success(servicePreference)
  );
  const mockStore = configureMockStore<GlobalState>();
  return mockStore({
    ...state
  } as GlobalState);
};

const renderComponent = (
  store: Store<unknown>,
  options: {
    channels?: ReadonlyArray<NotificationChannelEnum>;
  }
) =>
  renderScreenFakeNavRedux(
    () => (
      <ContactPreferencesToggles
        {...options}
        isSpecialService={false}
        serviceId={"aServiceID" as ServiceId}
      />
    ),
    "route",
    {},
    store
  );
