import { HttpClientSuccessResponse } from "@pagopa/io-react-native-http-client";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import reducer, {
  FIMS_SSO_ERROR_TAGS,
  FimsErrorStateType,
  FimsFlowStateTags,
  FimsSSOState,
  INITIAL_STATE
} from "../";
import { ServiceId } from "../../../../../../../definitions/backend/ServiceId";
import {
  Consent,
  TypeEnum
} from "../../../../../../../definitions/fims_sso/Consent";
import {
  applicationChangeState,
  startApplicationInitialization
} from "../../../../../../store/actions/application";
import { Action } from "../../../../../../store/actions/types";
import * as UTILS from "../../../utils";
import {
  fimsAcceptConsentsAction,
  fimsAcceptConsentsFailureAction,
  fimsCancelOrAbortAction,
  fimsGetConsentsListAction,
  fimsSignAndRetrieveInAppBrowserUrlAction
} from "../../actions";
import * as SELECTORS from "../../selectors";

const errorTags: ReadonlyArray<FIMS_SSO_ERROR_TAGS> = [
  "AUTHENTICATION",
  "GENERIC",
  "MISSING_INAPP_BROWSER"
];

const currentFlowStateTags: ReadonlyArray<FimsFlowStateTags> = [
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

describe("singleSignOn reducer", () => {
  it("Should match snapshot", () => {
    expect(INITIAL_STATE).toMatchSnapshot();
  });

  it("Should match INITIAL_STATE upon first invocation with 'undefined' input state and unrelated action 'applicationChangeState'", () => {
    const fimsSSOState = reducer(undefined, applicationChangeState("active"));
    expect(fimsSSOState).toEqual(INITIAL_STATE);
  });

  describe("Receiving 'startApplicationInitialization'", () => {
    const startApplicationInitializationAction =
      startApplicationInitialization();

    [true, false].forEach(shouldRestart =>
      currentFlowStateTags.forEach(currentFlowState =>
        it(
          shouldRestart
            ? `should reset the SSO state and trigger a forced fast login restart with currentFlowState=${currentFlowState}`
            : `should preserve the current SSO state by resetting to INITIAL_STATE with currentFlowState=${currentFlowState}`,
          () => {
            jest
              .spyOn(UTILS, "shouldRestartFimsAuthAfterFastLoginFailure")
              .mockReturnValue(shouldRestart);

            const initialState: FimsSSOState = {
              ...INITIAL_STATE,
              currentFlowState,
              ssoData: pot.some({} as Consent),
              relyingPartyServiceId: "01K1E048EYQ7212T55N82S6GVM" as ServiceId
            };

            const singleSignOnState = reducer(
              initialState,
              startApplicationInitializationAction
            );

            if (shouldRestart) {
              expect(singleSignOnState.currentFlowState).toEqual(
                "fastLogin_forced_restart"
              );
              expect(singleSignOnState.ssoData.kind).toEqual("PotNone");
              expect(singleSignOnState.relyingPartyServiceId).toBeUndefined();
            } else {
              expect(singleSignOnState).toEqual(INITIAL_STATE);
            }
          }
        )
      )
    );
  });

  describe("Receiving 'fimsGetConsentsListAction.request'", () => {
    const consentsResponse = {} as Consent;
    const ctaText = "Click here";
    const ctaUrl = "https://an.url/consent";

    errorTags.forEach(errorTag =>
      ssoDataPots(consentsResponse, errorTag).forEach(consentsList =>
        [true, false].forEach(ephemeralSessionOniOS =>
          currentFlowStateTags.forEach(currentFlowState =>
            it(`should request consents list with state='${consentsList.kind}', flow='${currentFlowState}', ephemeralSessionOniOS='${ephemeralSessionOniOS}', errorTag='${errorTag}'`, () => {
              const fimsGetConsentsListA = fimsGetConsentsListAction.request({
                ctaText,
                ctaUrl,
                ephemeralSessionOniOS
              });

              const singleSignOnState = reducer(
                {
                  ssoData: consentsList,
                  currentFlowState,
                  ephemeralSessionOniOS,
                  ctaText
                },
                fimsGetConsentsListA
              );

              expect(singleSignOnState.ctaText).toEqual(ctaText);
              expect(singleSignOnState.currentFlowState).toEqual("consents");
              expect(singleSignOnState.ssoData).toEqual(pot.noneLoading);
              expect(singleSignOnState.relyingPartyServiceId).toBeUndefined();
              expect(singleSignOnState.relyingPartyUrl).toEqual(ctaUrl);
              expect(singleSignOnState.ephemeralSessionOniOS).toEqual(
                ephemeralSessionOniOS
              );
            })
          )
        )
      )
    );
  });

  describe("Receiving 'fimsGetConsentsListAction.success'", () => {
    const relyingPartyServiceId = "01K1E048EYQ7212T55N82S6GVM" as ServiceId;
    const consent: Consent = {
      _links: {
        abort: { href: "https://an.url/abort" },
        consent: { href: "https://an.url/consent" }
      },
      redirect: { display_name: "Go to Redirect" },
      service_id: relyingPartyServiceId,
      type: TypeEnum.consent,
      user_metadata: [{ display_name: "fullname", name: "John Smith" }]
    };

    errorTags.forEach(errorTag =>
      ssoDataPots(consent, errorTag).forEach(consentsList =>
        [true, false].forEach(ephemeralSessionOniOS =>
          currentFlowStateTags.forEach(currentFlowState =>
            it(`should handle success with ssoData.kind='${consentsList.kind}', errorTag='${errorTag}', currentFlowState='${currentFlowState}', ephemeralSessionOniOS='${ephemeralSessionOniOS}'`, () => {
              const fimsGetConsentsListA =
                fimsGetConsentsListAction.success(consent);

              const singleSignOnState = reducer(
                {
                  ...INITIAL_STATE,
                  ssoData: consentsList,
                  currentFlowState,
                  ephemeralSessionOniOS
                },
                fimsGetConsentsListA
              );

              expect(singleSignOnState.ssoData).toEqual(pot.some(consent));
              expect(singleSignOnState.relyingPartyServiceId).toEqual(
                relyingPartyServiceId
              );
            })
          )
        )
      )
    );
  });

  describe("Receiving 'fimsAcceptConsentsAction'", () => {
    ["https://an.url/acceptUrl", undefined].forEach(acceptUrl =>
      currentFlowStateTags.forEach(currentFlowState =>
        it(`should handle fimsAcceptConsentsAction with acceptUrl='${acceptUrl}', currentFlowState='${currentFlowState}'`, () => {
          const fimsAcceptConsentsA = fimsAcceptConsentsAction({ acceptUrl });
          const initialState: FimsSSOState = {
            ...INITIAL_STATE,
            currentFlowState,
            ssoData: pot.some({} as Consent),
            relyingPartyServiceId: "01K1E048EYQ7212T55N82S6GVM" as ServiceId
          };

          const singleSignOnState = reducer(initialState, fimsAcceptConsentsA);

          expect(singleSignOnState.currentFlowState).toEqual(
            "in-app-browser-loading"
          );
          expect(singleSignOnState.ssoData).toEqual(pot.none);
        })
      )
    );
  });

  describe("Receiving 'fimsSignAndRetrieveInAppBrowserUrlAction.request'", () => {
    currentFlowStateTags.forEach(currentFlowState =>
      it(`should handle fimsSignAndRetrieveInAppBrowserUrlAction.request with currentFlowState='${currentFlowState}'`, () => {
        const actionPayload: HttpClientSuccessResponse = {
          type: "success",
          status: 200,
          body: "{}",
          headers: {}
        };

        const fimsSignAndRetrieveInAppBrowserUrlA =
          fimsSignAndRetrieveInAppBrowserUrlAction.request(actionPayload);
        const initialState: FimsSSOState = {
          ...INITIAL_STATE,
          currentFlowState,
          ssoData: pot.some({} as Consent),
          relyingPartyServiceId: "01K1E048EYQ7212T55N82S6GVM" as ServiceId
        };

        const singleSignOnState = reducer(
          initialState,
          fimsSignAndRetrieveInAppBrowserUrlA
        );

        expect(singleSignOnState.currentFlowState).toEqual(
          "in-app-browser-loading"
        );
        expect(singleSignOnState.ssoData).toEqual(pot.none);
      })
    );
  });

  describe("Receiving 'fimsSignAndRetrieveInAppBrowserUrlAction.success'", () => {
    const relyingPartyServiceId = "01K1E048EYQ7212T55N82S6GVM" as ServiceId;
    const consent: Consent = {
      _links: {
        abort: { href: "https://an.url/abort" },
        consent: { href: "https://an.url/consent" }
      },
      redirect: { display_name: "Go to Redirect" },
      service_id: relyingPartyServiceId,
      type: TypeEnum.consent,
      user_metadata: [{ display_name: "fullname", name: "John Smith" }]
    };

    errorTags.forEach(errorTag =>
      ssoDataPots(consent, errorTag).forEach(consentsList =>
        [true, false].forEach(ephemeralSessionOniOS =>
          currentFlowStateTags.forEach(currentFlowState =>
            it(`should handle success with ssoData.kind='${consentsList.kind}', errorTag='${errorTag}', currentFlowState='${currentFlowState}', ephemeralSessionOniOS='${ephemeralSessionOniOS}'`, () => {
              const fimsSignAndRetrieveInAppBrowserUrlA =
                fimsSignAndRetrieveInAppBrowserUrlAction.success();

              const singleSignOnState = reducer(
                {
                  ...INITIAL_STATE,
                  ssoData: consentsList,
                  currentFlowState,
                  ephemeralSessionOniOS
                },
                fimsSignAndRetrieveInAppBrowserUrlA
              );

              expect(singleSignOnState.currentFlowState).toEqual("idle");
            })
          )
        )
      )
    );
  });

  describe(` receiving 'fimsGetConsentsListAction.failure' or 'fimsAcceptConsentsFailureAction' or 'fimsSignAndRetrieveInAppBrowserUrlAction.failure'`, () => {
    const failureActions: ReadonlyArray<
      [string, (payload: FimsErrorStateType) => Action]
    > = [
      ["fimsGetConsentsListAction.failure", fimsGetConsentsListAction.failure],
      ["fimsAcceptConsentsFailureAction", fimsAcceptConsentsFailureAction],
      [
        "fimsSignAndRetrieveInAppBrowserUrlAction.failure",
        fimsSignAndRetrieveInAppBrowserUrlAction.failure
      ]
    ];

    failureActions.forEach(([name, actionCreator]) => {
      errorTags.forEach(errorTag =>
        currentFlowStateTags.forEach(currentFlowState =>
          it(`should handle ${name} with errorTag='${errorTag}', currentFlowState='${currentFlowState}'`, () => {
            const payload: FimsErrorStateType = {
              errorTag,
              debugMessage: "Failed"
            };

            const action = actionCreator(payload);
            const initialState: FimsSSOState = {
              ...INITIAL_STATE,
              currentFlowState,
              ssoData: pot.some({} as Consent),
              relyingPartyServiceId: "01K1E048EYQ7212T55N82S6GVM" as ServiceId
            };

            const singleSignOnState = reducer(initialState, action);

            expect(singleSignOnState.currentFlowState).toEqual("idle");
            expect(singleSignOnState.ssoData).toEqual(
              pot.toError(initialState.ssoData, payload)
            );
          })
        )
      );
    });
  });

  describe("Receiving 'fimsCancelOrAbortAction'", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    const fimsCancelOrAbortA = fimsCancelOrAbortAction();

    ["https://an.url/abort", undefined].forEach(abortUrl =>
      currentFlowStateTags.forEach(currentFlowState =>
        it(
          abortUrl
            ? `should set currentFlowState to 'abort' when abortUrl is present with currentFlowState=${currentFlowState}`
            : `should set currentFlowState to 'idle' when abortUrl is missing with currentFlowState=${currentFlowState}`,
          () => {
            jest
              .spyOn(SELECTORS, "abortUrlFromConsentsPot")
              .mockReturnValue(O.fromNullable(abortUrl));

            const initialState: FimsSSOState = {
              ...INITIAL_STATE,
              currentFlowState,
              ssoData: pot.some({} as Consent),
              relyingPartyServiceId: "01K1E048EYQ7212T55N82S6GVM" as ServiceId
            };

            const result = reducer(initialState, fimsCancelOrAbortA);
            expect(result.currentFlowState).toBe(abortUrl ? "abort" : "idle");
          }
        )
      )
    );
  });
});
