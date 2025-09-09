import { storeLinkingUrl } from "../../actions/linking";
import { linkingReducer } from "../linking";

describe("test for linking reducer", () => {
  it("should return the initial state", () => {
    expect(linkingReducer(undefined, {} as any)).toEqual({
      linkingUrl: null
    });
  });

  it("should handle storing a linking url", () => {
    const url = "https://example.com";
    expect(linkingReducer(undefined, storeLinkingUrl(url))).toEqual({
      linkingUrl: url
    });
  });
});
