import { clearLinkingUrl, storeLinkingUrl } from "..";

describe("linking actions", () => {
  it("should create an action to store a linking url", () => {
    const url = "https://example.com";
    const action = storeLinkingUrl(url);
    expect(action).toMatchSnapshot();
  });
  it("should create an action to clear the linking url", () => {
    const action = clearLinkingUrl();
    expect(action).toMatchSnapshot();
  });
});
