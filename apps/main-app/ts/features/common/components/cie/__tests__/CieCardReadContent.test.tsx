import { IOColors } from "@io-app/design-system";
import { render } from "@testing-library/react-native";
import { Platform, processColor } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import {
  findAllByStyle,
  findAllNodes,
  withDarkTheme
} from "../../../../../utils/testColors";
import * as UTILS from "../../../utils";
import {
  CieCardReadContent,
  CieCardReadContentProps,
  testable
} from "../CieCardReadContent";

jest.mock("@react-navigation/native");

describe.each<typeof Platform.OS>(["ios", "android"])(
  'CieCardReadContent when the Platform is "%s"',
  platform => {
    beforeAll(() => {
      jest.replaceProperty(Platform, "OS", platform);
      jest
        .spyOn(UTILS, "platformSelect")
        .mockImplementation(
          specifics =>
            specifics[Platform.OS] ??
            specifics["default" as keyof typeof specifics]
        );
    });

    afterAll(jest.clearAllMocks);

    it.each<CieCardReadContentProps>([
      {
        title: "Title",
        subtitle: "Subtitle",
        pictogram: "success",
        progress: 1
      },
      {
        title: "Title 2",
        pictogram: "empty",
        secondaryAction: {
          label: "Close",
          onPress: jest.fn
        }
      },
      {
        title: "Title 3",
        pictogram: "message",
        hiddenProgressBar: true,
        primaryAction: {
          label: "Open",
          onPress: jest.fn
        },
        secondaryAction: {
          label: "Close",
          onPress: jest.fn
        }
      }
    ])("should match the snapshot when the input props are: %o", props => {
      const component = render(<CieCardReadContent {...props} />);

      expect(component.toJSON()).toMatchSnapshot();
    });
  }
);

describe("CieCardReadContent in dark mode", () => {
  if (!testable) {
    throw new Error("testable is not available in test environment");
  }
  const { ContentAndroid, ContentIos } = testable;
  const props: CieCardReadContentProps = {
    title: "Title",
    pictogram: "success",
    progress: 0.5
  };

  it("should draw the iOS progress track with the dark divider token", () => {
    const DarkContent = withDarkTheme(ContentIos);
    const { toJSON } = render(<DarkContent {...props} />);

    expect(
      findAllByStyle(toJSON(), {
        height: 4,
        backgroundColor: IOColors.dark.stroke.default
      })
    ).toHaveLength(1);
  });

  it("should draw the Android progress ring with dark tokens", () => {
    const DarkContent = withDarkTheme(ContentAndroid);
    const { toJSON } = render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 0, height: 0 },
          insets: { top: 0, left: 0, right: 0, bottom: 0 }
        }}
      >
        <DarkContent {...props} />
      </SafeAreaProvider>
    );
    const [track, progress] = findAllNodes(
      toJSON(),
      node => node.type === "RNSVGCircle"
    );

    expect(track.props.stroke).toEqual({
      type: 0,
      payload: processColor(IOColors.dark.stroke.default)
    });
    expect(progress.props.stroke).toEqual({
      type: 0,
      payload: processColor(IOColors.dark.foreground.accent)
    });
  });
});
