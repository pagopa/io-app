import { trackIOOpenedFromUniversalAppLink } from "..";
import * as MIXPANEL from "../../../../mixpanel";

describe("index", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("trackIOOpenedFromUniversalAppLink", () => {
    describe("when Mixpanel is initialized", () => {
      beforeEach(() => {
        jest
          .spyOn(MIXPANEL, "isMixpanelInstanceInitialized")
          .mockReturnValue(true);
      });

      it("should call 'mixpanelTrack' with proper parameters when link is HTTPS", () => {
        const spyOnMixpanelTrack = jest
          .spyOn(MIXPANEL, "mixpanelTrack")
          .mockReturnValue(undefined);

        const httpsLink = "https://example.com/path?param=value";
        trackIOOpenedFromUniversalAppLink(httpsLink);

        expect(spyOnMixpanelTrack.mock.calls.length).toBe(1);
        expect(spyOnMixpanelTrack.mock.calls[0].length).toBe(2);
        expect(spyOnMixpanelTrack.mock.calls[0][0]).toBe(
          "IO_UNIVERSAL_APP_LINK"
        );
        expect(spyOnMixpanelTrack.mock.calls[0][1]).toEqual({
          event_category: "TECH",
          event_type: undefined,
          flow: undefined,
          link_id: "https://example.com/path"
        });
      });

      it("should call 'mixpanelTrack' with proper parameters when link is HTTP", () => {
        const spyOnMixpanelTrack = jest
          .spyOn(MIXPANEL, "mixpanelTrack")
          .mockReturnValue(undefined);

        const httpLink = "http://example.com/test";
        trackIOOpenedFromUniversalAppLink(httpLink);

        expect(spyOnMixpanelTrack.mock.calls.length).toBe(1);
        expect(spyOnMixpanelTrack.mock.calls[0].length).toBe(2);
        expect(spyOnMixpanelTrack.mock.calls[0][0]).toBe(
          "IO_UNIVERSAL_APP_LINK"
        );
        expect(spyOnMixpanelTrack.mock.calls[0][1]).toEqual({
          event_category: "TECH",
          event_type: undefined,
          flow: undefined,
          link_id: "http://example.com/test"
        });
      });

      it("should extract base path correctly from url with query string", () => {
        const spyOnMixpanelTrack = jest
          .spyOn(MIXPANEL, "mixpanelTrack")
          .mockReturnValue(undefined);

        const linkWithQuery =
          "https://continua.io.pagopa.it/abcdef?param1=value1&param2=value2";
        trackIOOpenedFromUniversalAppLink(linkWithQuery);

        expect(spyOnMixpanelTrack.mock.calls.length).toBe(1);
        expect(spyOnMixpanelTrack.mock.calls[0][1]).toEqual({
          event_category: "TECH",
          event_type: undefined,
          flow: undefined,
          link_id: "https://continua.io.pagopa.it/abcdef"
        });
      });

      it("should extract base path correctly from url with fragment", () => {
        const spyOnMixpanelTrack = jest
          .spyOn(MIXPANEL, "mixpanelTrack")
          .mockReturnValue(undefined);

        const linkWithFragment = "https://example.com/path#fragment";
        trackIOOpenedFromUniversalAppLink(linkWithFragment);

        expect(spyOnMixpanelTrack.mock.calls.length).toBe(1);
        expect(spyOnMixpanelTrack.mock.calls[0][1]).toEqual({
          event_category: "TECH",
          event_type: undefined,
          flow: undefined,
          link_id: "https://example.com/path"
        });
      });

      it("should handle HTTPS with uppercase correctly", () => {
        const spyOnMixpanelTrack = jest
          .spyOn(MIXPANEL, "mixpanelTrack")
          .mockReturnValue(undefined);

        const uppercaseLink = "HTTPS://EXAMPLE.COM/path";
        trackIOOpenedFromUniversalAppLink(uppercaseLink);

        expect(spyOnMixpanelTrack.mock.calls.length).toBe(1);
        expect(spyOnMixpanelTrack.mock.calls[0][0]).toBe(
          "IO_UNIVERSAL_APP_LINK"
        );
        expect(spyOnMixpanelTrack.mock.calls[0][1]).toEqual({
          event_category: "TECH",
          event_type: undefined,
          flow: undefined,
          link_id: "HTTPS://EXAMPLE.COM/path"
        });
      });

      it("should handle HTTP with mixed case correctly", () => {
        const spyOnMixpanelTrack = jest
          .spyOn(MIXPANEL, "mixpanelTrack")
          .mockReturnValue(undefined);

        const mixedCaseLink = "HtTp://example.com";
        trackIOOpenedFromUniversalAppLink(mixedCaseLink);

        expect(spyOnMixpanelTrack.mock.calls.length).toBe(1);
        expect(spyOnMixpanelTrack.mock.calls[0][0]).toBe(
          "IO_UNIVERSAL_APP_LINK"
        );
      });
    });

    describe("when Mixpanel is NOT initialized", () => {
      beforeEach(() => {
        jest
          .spyOn(MIXPANEL, "isMixpanelInstanceInitialized")
          .mockReturnValue(false);
      });

      it("should enqueue event when isMixpanelEnabled is true", () => {
        const spyOnEnqueueMixpanelEvent = jest
          .spyOn(MIXPANEL, "enqueueMixpanelEvent")
          .mockReturnValue(undefined);
        const spyOnMixpanelTrack = jest
          .spyOn(MIXPANEL, "mixpanelTrack")
          .mockReturnValue(undefined);

        const httpsLink = "https://example.com/path";
        trackIOOpenedFromUniversalAppLink(httpsLink, true);

        expect(spyOnMixpanelTrack).not.toHaveBeenCalled();
        expect(spyOnEnqueueMixpanelEvent).toHaveBeenCalledTimes(1);
        expect(spyOnEnqueueMixpanelEvent).toHaveBeenCalledWith(
          "IO_UNIVERSAL_APP_LINK",
          httpsLink,
          {
            event_category: "TECH",
            event_type: undefined,
            flow: undefined,
            link_id: "https://example.com/path"
          }
        );
      });

      it("should enqueue event when isMixpanelEnabled is null (not yet decided)", () => {
        const spyOnEnqueueMixpanelEvent = jest
          .spyOn(MIXPANEL, "enqueueMixpanelEvent")
          .mockReturnValue(undefined);
        const spyOnMixpanelTrack = jest
          .spyOn(MIXPANEL, "mixpanelTrack")
          .mockReturnValue(undefined);

        const httpsLink = "https://example.com/path";
        trackIOOpenedFromUniversalAppLink(httpsLink, null);

        expect(spyOnMixpanelTrack).not.toHaveBeenCalled();
        expect(spyOnEnqueueMixpanelEvent).toHaveBeenCalledTimes(1);
      });

      it("should enqueue event when isMixpanelEnabled is undefined (backward compatibility)", () => {
        const spyOnEnqueueMixpanelEvent = jest
          .spyOn(MIXPANEL, "enqueueMixpanelEvent")
          .mockReturnValue(undefined);
        const spyOnMixpanelTrack = jest
          .spyOn(MIXPANEL, "mixpanelTrack")
          .mockReturnValue(undefined);

        const httpsLink = "https://example.com/path";
        trackIOOpenedFromUniversalAppLink(httpsLink);

        expect(spyOnMixpanelTrack).not.toHaveBeenCalled();
        expect(spyOnEnqueueMixpanelEvent).toHaveBeenCalledTimes(1);
      });

      it("should NOT enqueue event when isMixpanelEnabled is false", () => {
        const spyOnEnqueueMixpanelEvent = jest
          .spyOn(MIXPANEL, "enqueueMixpanelEvent")
          .mockReturnValue(undefined);
        const spyOnMixpanelTrack = jest
          .spyOn(MIXPANEL, "mixpanelTrack")
          .mockReturnValue(undefined);

        const httpsLink = "https://example.com/path";
        trackIOOpenedFromUniversalAppLink(httpsLink, false);

        expect(spyOnMixpanelTrack).not.toHaveBeenCalled();
        expect(spyOnEnqueueMixpanelEvent).not.toHaveBeenCalled();
      });
    });

    it("should NOT call 'mixpanelTrack' when link is a deep link (not HTTP/HTTPS)", () => {
      jest
        .spyOn(MIXPANEL, "isMixpanelInstanceInitialized")
        .mockReturnValue(true);
      const spyOnMixpanelTrack = jest
        .spyOn(MIXPANEL, "mixpanelTrack")
        .mockReturnValue(undefined);

      const deepLink = "ioit://main/messages";
      trackIOOpenedFromUniversalAppLink(deepLink);

      expect(spyOnMixpanelTrack.mock.calls.length).toBe(0);
    });

    it("should NOT call 'mixpanelTrack' when link is not a valid HTTP/HTTPS link", () => {
      jest
        .spyOn(MIXPANEL, "isMixpanelInstanceInitialized")
        .mockReturnValue(true);
      const spyOnMixpanelTrack = jest
        .spyOn(MIXPANEL, "mixpanelTrack")
        .mockReturnValue(undefined);

      const invalidLink = "tel:1234567890";
      trackIOOpenedFromUniversalAppLink(invalidLink);

      expect(spyOnMixpanelTrack.mock.calls.length).toBe(0);
    });
  });
});
