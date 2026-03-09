import { render } from "@testing-library/react-native";
import { Platform } from "react-native";
import {
  CieCardReadContentProps,
  CieCardReadContent
} from "../CieCardReadContent";
import * as UTILS from "../../../utils";

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
