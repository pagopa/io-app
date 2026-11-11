import { IOColors } from "@io-app/design-system";
import { render } from "@testing-library/react-native";

import { findAllByStyle, withDarkTheme } from "../../../../../utils/testColors";
import { ItwRetryableQRCode } from "../ItwRetryableQRCode";

describe("ItwRetryableQRCode", () => {
  it("should use the dark neutral banner background for the retry box in dark mode", () => {
    const DarkQRCode = withDarkTheme(ItwRetryableQRCode);
    const { getByText, toJSON } = render(
      <DarkQRCode
        onRetry={jest.fn()}
        retryDescription="Retry description"
        retryLabel="Retry"
        shouldRetry={true}
        size={200}
        value="value"
      />
    );

    expect(getByText("Retry description")).toBeTruthy();
    expect(
      findAllByStyle(toJSON(), {
        aspectRatio: 1,
        backgroundColor: IOColors.dark.component.banner.background.neutral
      })
    ).toHaveLength(1);
  });
});
