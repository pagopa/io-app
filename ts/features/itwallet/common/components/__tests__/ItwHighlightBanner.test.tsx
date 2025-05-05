import { render } from "@testing-library/react-native";
import { ItwHighlightBanner } from "../ItwHighlightBanner";

type SizeVariant = React.ComponentProps<typeof ItwHighlightBanner>["size"];

describe("ItwHighlightBanner", () => {
  it.each(["large", "small"])(
    "should match the snapshot for %s variant",
    variant => {
      const dummyHandler = jest.fn();
      const component = render(
        <ItwHighlightBanner
          size={variant as SizeVariant}
          title="title"
          description="description"
          action="action"
          onPress={dummyHandler}
        />
      );
      expect(component).toMatchSnapshot();
    }
  );
});
