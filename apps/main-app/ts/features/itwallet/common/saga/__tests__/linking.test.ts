import { testSaga } from "redux-saga-test-plan";

import NavigationService from "../../../../../navigation/NavigationService";
import { ITW_ROUTES } from "../../../navigation/routes";
import { parseItwDeepLink } from "../../utils/linking";
import { handleItwStoredDeepLink } from "../linking";

describe("handleItwStoredDeepLink", () => {
  it("navigates to a regular ITW route", () => {
    const deepLink = parseItwDeepLink(
      "https://continua.io.pagopa.it/itw/discovery/info"
    );

    if (deepLink === undefined) {
      throw new Error("Expected a valid ITW deep link");
    }

    testSaga(handleItwStoredDeepLink, deepLink)
      .next()
      .inspect(effect => {
        const callEffect = effect as {
          payload: {
            args: ReadonlyArray<unknown>;
            fn: unknown;
          };
        };

        expect(callEffect.payload.fn).toBe(
          NavigationService.dispatchNavigationAction
        );
        expect(callEffect.payload.args[0]).toMatchObject({
          type: "NAVIGATE",
          payload: {
            name: ITW_ROUTES.MAIN,
            params: {
              initial: true,
              path: "itw/discovery/info",
              screen: ITW_ROUTES.LANDING.DISCOVERY
            }
          }
        });
      })
      .next()
      .returns(true);
  });

  it("navigates to a credential-offer route", () => {
    const credentialOfferUri =
      "openid-credential-offer://?credential_offer=offer";
    const deepLink = parseItwDeepLink(credentialOfferUri);

    if (deepLink === undefined) {
      throw new Error("Expected a valid ITW credential-offer deep link");
    }

    testSaga(handleItwStoredDeepLink, deepLink)
      .next()
      .inspect(effect => {
        const callEffect = effect as {
          payload: {
            args: ReadonlyArray<unknown>;
            fn: unknown;
          };
        };

        expect(callEffect.payload.fn).toBe(
          NavigationService.dispatchNavigationAction
        );
        expect(callEffect.payload.args[0]).toMatchObject({
          type: "NAVIGATE",
          payload: {
            name: ITW_ROUTES.MAIN,
            params: {
              initial: true,
              path: expect.stringContaining("itw/credential-offer"),
              params: {
                itwCredentialOfferUri: credentialOfferUri
              },
              screen: ITW_ROUTES.ISSUANCE.CREDENTIAL_OFFER_INTRO
            }
          }
        });
      })
      .next()
      .returns(true);
  });

  it("does not navigate when action creation fails", () => {
    testSaga(handleItwStoredDeepLink, {
      path: "itw/unknown"
    })
      .next()
      .returns(false);
  });
});
