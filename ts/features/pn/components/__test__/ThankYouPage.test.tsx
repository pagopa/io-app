import { renderComponentWithStoreAndNavigationContextForFocus } from "../../../messages/utils/__tests__/testUtils.test";
import { ThankYouPage } from "../ThankYouPage";

describe("ThankYouPage", () => {
  it("should match snapshot", () => {
    const { toJSON } = renderComponentWithStoreAndNavigationContextForFocus(
      <ThankYouPage />,
      true
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
