import { backgroundLinkingReducer, storedLinkingUrlSelector } from "..";
import { clearLinkingUrl, storeLinkingUrl } from "../../actions";

describe("background linking reducer", () => {
  it("should return the initial state", () => {
    const expected = {};
    const reducer = backgroundLinkingReducer(undefined, {} as any);
    expect(reducer).toEqual(expected);
  });

  it("should handle storing a linking url", () => {
    const url = "https://example.com";
    const expected = {
      linkingUrl: url
    };
    const reducer = backgroundLinkingReducer(undefined, storeLinkingUrl(url));
    expect(reducer).toEqual(expected);
  });
  it("should handle clearing the linking url", () => {
    const url = "https://example.com";
    const initialState = {
      linkingUrl: url
    };
    const expected = {};
    const reducer = backgroundLinkingReducer(initialState, clearLinkingUrl());
    expect(reducer).toEqual(expected);
  });
  describe("selectors", () => {
    ["https://example.com", undefined].forEach(item =>
      it(`storedlinkingUrlSelector should return ${
        item === undefined
          ? "undefined when no link is stored"
          : "an url that is stored in the reducer"
      }`, () => {
        const state = {
          features: {
            backgroundLinking:
              item === undefined
                ? {}
                : {
                    linkingUrl: item
                  }
          }
        } as any;
        const linkingUrl = storedLinkingUrlSelector(state);
        expect(linkingUrl).toEqual(item);
      })
    );
  });
});
