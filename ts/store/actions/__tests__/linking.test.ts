import { storeLinkingUrl } from "../linking";

describe("linking actions", () => {
  it("should create an action to store a linking url", () => {
    const url = "https://example.com";
    const action = storeLinkingUrl(url);
    expect(action).toMatchSnapshot();
  });
});
