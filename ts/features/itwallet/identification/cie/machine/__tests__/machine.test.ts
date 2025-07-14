import { createActor, fromCallback, fromPromise } from "xstate";
import { itwCieMachine } from "../machine";
import { CieInput } from "../input";
import { getInitialContext } from "../context";

describe("itwCieMachine", () => {
  const mockStartCieManager = jest.fn();
  const mockCieManagerActor = jest.fn();

  const mockConfigureStatusAlerts = jest.fn();
  const mockUpdateStatusAlert = jest.fn();
  const mockTrackError = jest.fn();

  const testMachine = itwCieMachine.provide({
    actors: {
      startCieManager: fromPromise(mockStartCieManager),
      cieManagerActor: fromCallback(mockCieManagerActor)
    },
    actions: {
      configureStatusAlerts: mockConfigureStatusAlerts,
      updateStatusAlert: mockUpdateStatusAlert,
      trackError: mockTrackError
    }
  });

  it("should handle the happy path", () => {
    const testInput: CieInput = {
      pin: "12345678",
      authenticationUrl: "http://pagopa.it",
      isScreenReaderEnabled: true,
      env: "pre"
    };

    const initialContext = getInitialContext(testInput);

    // Starting

    const actor = createActor(testMachine, {
      input: testInput
    });
    actor.start();

    expect(actor.getSnapshot().value).toStrictEqual("WaitingForUrl");
    expect(actor.getSnapshot().context).toStrictEqual(initialContext);

    expect(mockCieManagerActor).toHaveBeenCalled();
    expect(mockConfigureStatusAlerts).toHaveBeenCalled();

    // Webview load service provider url successfully

    actor.send({
      type: "set-service-provider-url",
      url: "http://poagopa.it/serviceprovider"
    });

    expect(actor.getSnapshot().value).toStrictEqual("ReadingCard");
    expect(actor.getSnapshot().context).toStrictEqual({
      ...initialContext,
      serviceProviderUrl: "http://poagopa.it/serviceprovider"
    });

    expect(mockStartCieManager).toHaveBeenCalledTimes(1);

    // CIE SDK sends read events

    actor.send({
      type: "cie-read-event",
      event: { name: "EVENT", progress: 0.123 }
    });

    expect(actor.getSnapshot().value).toStrictEqual("ReadingCard");
    expect(actor.getSnapshot().context).toStrictEqual({
      ...initialContext,
      serviceProviderUrl: "http://poagopa.it/serviceprovider",
      readProgress: 0.123
    });

    expect(mockUpdateStatusAlert).toHaveBeenCalled();

    // CIE SDK sends success event

    actor.send({
      type: "cie-read-success",
      authorizationUrl: "http://poagopa.it/authz"
    });

    expect(actor.getSnapshot().value).toStrictEqual("Authorizing");
    expect(actor.getSnapshot().context).toStrictEqual({
      ...initialContext,
      serviceProviderUrl: "http://poagopa.it/serviceprovider",
      readProgress: 0.123,
      authorizationUrl: "http://poagopa.it/authz"
    });

    // User completes authorization

    actor.send({
      type: "complete-authentication",
      redirectUrl: "http://poagopa.it/redirect"
    });

    expect(actor.getSnapshot().value).toStrictEqual("Completed");
    expect(actor.getSnapshot().context).toStrictEqual({
      ...initialContext,
      serviceProviderUrl: "http://poagopa.it/serviceprovider",
      readProgress: 0.123,
      authorizationUrl: "http://poagopa.it/authz",
      redirectUrl: "http://poagopa.it/redirect"
    });

    expect(actor.getSnapshot().status).toBe("done");
  });

  it("should handle errors during CIE reading", () => {
    const testInput: CieInput = {
      pin: "12345678",
      authenticationUrl: "http://pagopa.it",
      isScreenReaderEnabled: true,
      env: "pre"
    };

    const initialContext = getInitialContext(testInput);

    // Starting

    const actor = createActor(testMachine, {
      input: testInput
    });
    actor.start();

    // Webview load service provider url successfully

    actor.send({
      type: "set-service-provider-url",
      url: "http://poagopa.it/serviceprovider"
    });

    // CIE SDK sends success event

    actor.send({
      type: "cie-read-error",
      error: {
        name: "TAG_LOST",
        message: "tag lost"
      }
    });

    expect(actor.getSnapshot().value).toStrictEqual("Failure");
    expect(actor.getSnapshot().context).toStrictEqual({
      ...initialContext,
      serviceProviderUrl: "http://poagopa.it/serviceprovider",
      failure: {
        name: "TAG_LOST",
        message: "tag lost"
      }
    });
  });

  it("should handle errors in the authn webview", () => {
    const testInput: CieInput = {
      pin: "12345678",
      authenticationUrl: "http://pagopa.it",
      isScreenReaderEnabled: true,
      env: "pre"
    };

    const initialContext = getInitialContext(testInput);

    // Starting

    const actor = createActor(testMachine, {
      input: testInput
    });
    actor.start();

    // Webview error

    actor.send({
      type: "webview-error",
      message: "WebView error"
    });

    expect(actor.getSnapshot().value).toStrictEqual("Failure");
    expect(actor.getSnapshot().context).toStrictEqual({
      ...initialContext,
      failure: {
        name: "WEBVIEW_ERROR",
        message: "WebView error"
      }
    });

    // User retries

    actor.send({
      type: "retry"
    });

    expect(actor.getSnapshot().value).toStrictEqual("WaitingForUrl");
    expect(actor.getSnapshot().context).toStrictEqual({
      ...initialContext
    });
  });

  it("should handle errors in the authz webview", () => {
    const testInput: CieInput = {
      pin: "12345678",
      authenticationUrl: "http://pagopa.it",
      isScreenReaderEnabled: true,
      env: "pre"
    };

    const initialContext = getInitialContext(testInput);

    // Starting

    const actor = createActor(testMachine, {
      input: testInput
    });
    actor.start();

    // Webview load service provider url successfully

    actor.send({
      type: "set-service-provider-url",
      url: "http://poagopa.it/serviceprovider"
    });

    // CIE SDK sends read events

    actor.send({
      type: "cie-read-event",
      event: { name: "EVENT", progress: 0.123 }
    });

    // CIE SDK sends success event

    actor.send({
      type: "cie-read-success",
      authorizationUrl: "http://poagopa.it/authz"
    });

    // User completes authorization

    actor.send({
      type: "webview-error",
      message: "WebView error"
    });

    expect(actor.getSnapshot().value).toStrictEqual("Failure");
    expect(actor.getSnapshot().context).toStrictEqual({
      ...initialContext,
      serviceProviderUrl: "http://poagopa.it/serviceprovider",
      readProgress: 0.123,
      authorizationUrl: "http://poagopa.it/authz",
      failure: {
        name: "WEBVIEW_ERROR",
        message: "WebView error"
      }
    });
  });
});
