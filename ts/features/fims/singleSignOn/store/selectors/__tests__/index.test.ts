import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import {
  abortUrlFromConsentsPot,
  fimsAuthenticationErrorTagSelector,
  fimsAuthenticationFailedSelector,
  fimsConsentsDataSelector,
  fimsCtaTextSelector,
  fimsDebugDataSelector,
  fimsEphemeralSessionOniOSSelector,
  fimsLoadingStateSelector,
  fimsPartialAbortUrl,
  fimsRelyingPartyDomainSelector,
  fimsRelyingPartyUrlIfFastLoginSelector,
  fimsRelyingPartyUrlSelector,
  relyingPartyServiceIdSelector
} from "../";
import { Consent } from "../../../../../../../definitions/fims_sso/Consent";
import { GlobalState } from "../../../../../../store/reducers/types";
import * as potUtils from "../../../../../../utils/pot";
import { FIMS_SSO_ERROR_TAGS, FimsFlowStateTags } from "../../reducers";

const errorTags: ReadonlyArray<FIMS_SSO_ERROR_TAGS> = [
  "AUTHENTICATION",
  "GENERIC",
  "MISSING_INAPP_BROWSER"
];

const flowStateTags: ReadonlyArray<FimsFlowStateTags> = [
  "abort",
  "consents",
  "fastLogin_forced_restart",
  "idle",
  "in-app-browser-loading"
];

const ssoDataPots = (
  consent: Consent,
  errorTag: FIMS_SSO_ERROR_TAGS = "GENERIC",
  debugMessage: string = "Failed"
) => [
  pot.none,
  pot.noneLoading,
  pot.noneUpdating(consent),
  pot.noneError({ errorTag, debugMessage }),
  pot.some(consent),
  pot.someLoading(consent),
  pot.someUpdating(consent, consent),
  pot.someError(consent, {
    errorTag,
    debugMessage
  })
];

describe("singleSignOn selectors", () => {
  describe("fimsConsentsDataSelector", () => {
    it("should return ssoData from fims.sso", () => {
      const ssoData = pot.some({} as Consent);
      const state = {
        features: {
          fims: {
            sso: {
              ssoData
            }
          }
        }
      } as GlobalState;
      const consentsData = fimsConsentsDataSelector(state);
      expect(consentsData).toBe(ssoData);
    });
  });

  describe("fimsRelyingPartyDomainSelector", () => {
    const relyingPartyUrl = "https://pagopa.gov.it/test";
    const expectUrl = "https://pagopa.gov.it";
    it("should extract domain from URL", () => {
      const state = {
        features: {
          fims: {
            sso: {
              relyingPartyUrl
            }
          }
        }
      } as GlobalState;
      const consentsData = fimsRelyingPartyDomainSelector(state);
      expect(consentsData).toBe(expectUrl);
    });

    it("should return undefined when relyingPartyUrl is undefined", () => {
      const state = {
        features: {
          fims: {
            sso: {}
          }
        }
      } as GlobalState;
      const consentsData = fimsRelyingPartyDomainSelector(state);
      expect(consentsData).toBeUndefined();
    });
  });

  describe("fimsRelyingPartyUrlSelector", () => {
    const relyingPartyUrl = "https://pagopa.gov.it/test";
    it("should return relyingPartyUrl", () => {
      const state = {
        features: {
          fims: {
            sso: {
              relyingPartyUrl
            }
          }
        }
      } as GlobalState;
      const consentsData = fimsRelyingPartyUrlSelector(state);
      expect(consentsData).toBe(relyingPartyUrl);
    });
  });

  describe("fimsCtaTextSelector", () => {
    it("should return ctaText", () => {
      const ctaText = "Click here";
      const state = {
        features: {
          fims: {
            sso: {
              ctaText
            }
          }
        }
      } as GlobalState;
      const consentsData = fimsCtaTextSelector(state);
      expect(consentsData).toBe(ctaText);
    });
  });

  describe("relyingPartyServiceIdSelector", () => {
    it("should return relyingPartyServiceId", () => {
      const serviceId = "abc1234";
      const state = {
        features: {
          fims: {
            sso: {
              relyingPartyServiceId: serviceId
            }
          }
        }
      } as GlobalState;
      const consentsData = relyingPartyServiceIdSelector(state);
      expect(consentsData).toBe(serviceId);
    });
  });

  describe("fimsEphemeralSessionOniOSSelector", () => {
    [true, false].forEach(ephemeralSessionOniOS =>
      it(`should return ephemeralSessionOniOS='${ephemeralSessionOniOS}'`, () => {
        const state = {
          features: {
            fims: {
              sso: {
                ephemeralSessionOniOS
              }
            }
          }
        } as GlobalState;
        const consentsData = fimsEphemeralSessionOniOSSelector(state);
        expect(consentsData).toBe(ephemeralSessionOniOS);
      })
    );
  });

  describe("fimsPartialAbortUrl", () => {
    const consentUrl = "https://example.com/consent";
    const abortUrl = "https://example.com/abort";
    const consent = {
      _links: {
        consent: { href: consentUrl },
        abort: {
          href: abortUrl
        }
      }
    } as Consent;
    errorTags.forEach(errorTag =>
      ssoDataPots(consent, errorTag).forEach(ssoDataPot => {
        const isSome =
          ssoDataPot.kind === "PotSome" ||
          ssoDataPot.kind === "PotSomeError" ||
          ssoDataPot.kind === "PotSomeLoading" ||
          ssoDataPot.kind === "PotSomeUpdating";

        it(`When pot in ssoData state is of type '${
          ssoDataPot.kind
        }', it should return '${isSome ? abortUrl : undefined}'`, () => {
          const globalState = {
            features: {
              fims: {
                sso: {
                  ssoData: ssoDataPot
                }
              }
            }
          } as GlobalState;

          const consentsDataPot = fimsPartialAbortUrl(globalState);
          const expected = isSome ? abortUrl : undefined;
          expect(consentsDataPot).toEqual(expected);
        });
      })
    );
  });

  describe("abortUrlFromConsentsPot", () => {
    const consentUrl = "https://example.com/consent";
    const abortUrl = "https://example.com/abort";
    const consent = {
      _links: {
        consent: { href: consentUrl },
        abort: {
          href: abortUrl
        }
      }
    } as Consent;
    errorTags.forEach(errorTag =>
      ssoDataPots(consent, errorTag).forEach(ssoDataPot => {
        const isSome =
          ssoDataPot.kind === "PotSome" ||
          ssoDataPot.kind === "PotSomeError" ||
          ssoDataPot.kind === "PotSomeLoading" ||
          ssoDataPot.kind === "PotSomeUpdating";

        it(`When pot is of type '${ssoDataPot.kind}', it should return '${
          isSome ? "O.some(abortUrl)" : "O.none"
        }'`, () => {
          const consentsDataPot = abortUrlFromConsentsPot(ssoDataPot);
          const expected = isSome ? O.some(abortUrl) : O.none;
          expect(consentsDataPot).toEqual(expected);
        });
      })
    );
  });

  describe("fimsAuthenticationFailedSelector", () =>
    ssoDataPots({} as Consent).forEach(ssoDataPot => {
      const expectedOutput =
        ssoDataPot.kind === "PotNoneError" ||
        ssoDataPot.kind === "PotSomeError";
      it(`When 'features.fims.sso.ssoData' is of type '${ssoDataPot.kind}', it should return '${expectedOutput}'`, () => {
        const globalState = {
          features: {
            fims: {
              sso: {
                ssoData: ssoDataPot
              }
            }
          }
        } as GlobalState;
        const consentsDataPot = fimsAuthenticationFailedSelector(globalState);
        expect(consentsDataPot).toBe(expectedOutput);
      });
    }));

  describe("fimsAuthenticationErrorTagSelector", () => {
    errorTags.forEach(errorTag =>
      ssoDataPots({} as Consent, errorTag).forEach(ssoDataPot => {
        const isError =
          ssoDataPot.kind === "PotNoneError" ||
          ssoDataPot.kind === "PotSomeError";
        it(`When 'features.fims.sso.ssoData' is of type '${
          ssoDataPot.kind
        }', it should return ${
          isError ? "errorTag=" + "'" + errorTag + "'" : "'undefined'"
        }`, () => {
          const globalState = {
            features: {
              fims: {
                sso: {
                  ssoData: ssoDataPot
                }
              }
            }
          } as GlobalState;
          const consentsDataPot =
            fimsAuthenticationErrorTagSelector(globalState);
          if (isError) {
            expect(consentsDataPot).toBe(errorTag);
          } else {
            expect(consentsDataPot).toBeUndefined();
          }
        });
      })
    );
  });

  describe("fimsDebugDataSelector", () => {
    const debugMessage = "Failed to load consents";
    [true, false].forEach(isDebugModeEnabled =>
      ssoDataPots({} as Consent, undefined, debugMessage).forEach(
        ssoDataPot => {
          const isError =
            ssoDataPot.kind === "PotNoneError" ||
            ssoDataPot.kind === "PotSomeError";
          it(`When isDebugModeEnabled=${isDebugModeEnabled} and 'features.fims.sso.ssoData' is of type '${
            ssoDataPot.kind
          }', it should return ${
            isError ? "debugMessage='" + debugMessage + "'" : "'undefined'"
          }`, () => {
            const globalState = {
              debug: {
                isDebugModeEnabled
              },
              features: {
                fims: {
                  sso: {
                    ssoData: ssoDataPot
                  }
                }
              }
            } as GlobalState;
            const consentsDataPot = fimsDebugDataSelector(globalState);
            if (isDebugModeEnabled && isError) {
              expect(consentsDataPot).toBe(debugMessage);
            } else {
              expect(consentsDataPot).toBeUndefined();
            }
          });
        }
      )
    );
  });

  // eslint-disable-next-line sonarjs/cognitive-complexity
  describe("fimsLoadingStateSelector exhaustive tests", () => {
    beforeEach(() => {
      jest.restoreAllMocks();
    });

    flowStateTags.forEach(flowState => {
      [true, false].forEach(isLoading => {
        [true, false].forEach(_isStrictNone => {
          test(`should return '${
            flowState === "consents"
              ? isLoading || _isStrictNone
                ? "consents"
                : "undefined"
              : flowState
          }' when state='${flowState}', isLoading=${isLoading}, isStrictNone=${_isStrictNone}`, () => {
            const globalState = {
              features: {
                fims: {
                  sso: {
                    currentFlowState: flowState,
                    ssoData: pot.none
                  }
                }
              }
            } as GlobalState;

            jest.spyOn(pot, "isLoading").mockReturnValue(isLoading);
            jest.spyOn(potUtils, "isStrictNone").mockReturnValue(_isStrictNone);

            const consentsData = fimsLoadingStateSelector(globalState);

            if (flowState === "consents") {
              if (isLoading || _isStrictNone) {
                expect(consentsData).toEqual("consents");
              } else {
                expect(consentsData).toBeUndefined();
              }
            } else {
              expect(consentsData).toEqual(flowState);
            }
          });
        });
      });
    });
  });

  describe("fimsRelyingPartyUrlIfFastLoginSelector", () => {
    const url = "https://fast-login.it";
    [url, undefined].forEach(relyingPartyUrl =>
      flowStateTags.forEach(currentFlowState =>
        it(`When relyingPartyUrl='${relyingPartyUrl}' and currentFlowState='${currentFlowState}' should return '${
          currentFlowState === "fastLogin_forced_restart" ? url : undefined
        }'`, () => {
          const globalState = {
            features: {
              fims: {
                sso: {
                  relyingPartyUrl,
                  currentFlowState
                }
              }
            }
          } as GlobalState;

          const consentsData =
            fimsRelyingPartyUrlIfFastLoginSelector(globalState);

          if (consentsData && currentFlowState === "fastLogin_forced_restart") {
            expect(consentsData).toBe(url);
          } else {
            expect(consentsData).toBeUndefined();
          }
        })
      )
    );
  });
});
