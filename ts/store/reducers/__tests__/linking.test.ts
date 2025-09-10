import { storeLinkingUrl } from "../../actions/linking";
import { backgroundLinkingReducer } from "../linking";

describe("test for linking reducer", () => {
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
});
