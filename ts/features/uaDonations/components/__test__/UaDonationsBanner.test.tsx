// import React from "react";

import { createStore, Store } from "redux";
import { MockStore } from "redux-mock-store";
import ROUTES from "../../../../navigation/routes";
import { applicationChangeState } from "../../../../store/actions/application";
import { backendStatusLoadSuccess } from "../../../../store/actions/backendStatus";
import { appReducer } from "../../../../store/reducers";
import { baseRawBackendStatus } from "../../../../store/reducers/__mock__/backendStatus";
import { GlobalState } from "../../../../store/reducers/types";
import { getFullLocale } from "../../../../utils/locale";
import { renderScreenFakeNavRedux } from "../../../../utils/testWrapper";
import { UaDonationsBanner } from "../UaDonationsBanner";

jest.mock("../../../../config", () => ({ uaDonationsEnabled: true }));

describe("UaDonationsBanner", () => {
  jest.useFakeTimers();

  describe("When the store is in default state and BACKEND_STATUS_LOAD_SUCCESS has not been dispatched", () => {
    it("Should not render the UaDonationsBanner", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, globalState as any);
      const result = renderComponent(store);

      expect(result.component.queryByTestId("UaDonationsBanner")).toBeNull();
    });
  });

  describe("When a backendStatusLoadSuccess is received", () => {
    describe.each`
      uaDonationsEnabled | uaDonationsBannerVisible | uaDonationsBannerDescription
      ${false}           | ${false}                 | ${baseRawBackendStatus.config.uaDonations.banner.description}
      ${true}            | ${false}                 | ${baseRawBackendStatus.config.uaDonations.banner.description}
      ${false}           | ${true}                  | ${baseRawBackendStatus.config.uaDonations.banner.description}
      ${true}            | ${true}                  | ${{ "it-IT": "", "en-EN": "" }}
    `(
      "And uaDonations.enabled === $uaDonationsEnabled, uaDonations.banner.visible === $uaDonationsBannerVisible and uaDonations.banner.description === $uaDonationsBannerDescription",
      ({
        uaDonationsEnabled,
        uaDonationsBannerVisible,
        uaDonationsBannerDescription
      }) => {
        const globalState = appReducer(
          undefined,
          applicationChangeState("active")
        );
        const store = createStore(appReducer, globalState as any);
        store.dispatch(
          backendStatusLoadSuccess({
            ...baseRawBackendStatus,
            config: {
              ...baseRawBackendStatus.config,
              uaDonations: {
                ...baseRawBackendStatus.config.uaDonations,
                enabled: uaDonationsEnabled,
                banner: {
                  ...baseRawBackendStatus.config.uaDonations.banner,
                  visible: uaDonationsBannerVisible,
                  description: uaDonationsBannerDescription
                }
              }
            }
          })
        );
        it("Should not render the UaDonationsBanner", () => {
          const result = renderComponent(store);

          expect(
            result.component.queryByTestId("UaDonationsBanner")
          ).toBeNull();
        });
      }
    );

    describe("And uaDonations.enabled === true, uaDonations.banner.visible === true", () => {
      it("Should render the UaDonationsBanner", () => {
        const globalState = appReducer(
          undefined,
          applicationChangeState("active")
        );
        const store = createStore(appReducer, globalState as any);
        store.dispatch(
          backendStatusLoadSuccess({
            ...baseRawBackendStatus,
            config: {
              ...baseRawBackendStatus.config,
              uaDonations: {
                ...baseRawBackendStatus.config.uaDonations,
                enabled: true,
                banner: {
                  ...baseRawBackendStatus.config.uaDonations.banner,
                  visible: true
                }
              }
            }
          })
        );

        const result = renderComponent(store);

        expect(
          result.component.getByText(
            baseRawBackendStatus.config.uaDonations.banner.description[
              getFullLocale()
            ]
          )
        ).not.toBeNull();

        store.dispatch(
          backendStatusLoadSuccess({
            ...baseRawBackendStatus,
            config: {
              ...baseRawBackendStatus.config,
              uaDonations: {
                ...baseRawBackendStatus.config.uaDonations,
                enabled: true,
                banner: {
                  ...baseRawBackendStatus.config.uaDonations.banner,
                  visible: true,
                  description: {
                    "it-IT": "textUpdate",
                    "en-EN": "textUpdate"
                  }
                }
              }
            }
          })
        );

        expect(result.component.getByText("textUpdate")).not.toBeNull();
      });
    });
  });
});

const renderComponent = (store: MockStore<GlobalState> | Store) => ({
  component: renderScreenFakeNavRedux<GlobalState>(
    UaDonationsBanner,
    ROUTES.MESSAGES_HOME,
    {},
    store
  ),
  store
});
