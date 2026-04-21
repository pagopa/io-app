import { fireEvent, render } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import { ItwStoredCredentialsMocks } from "../../../../common/utils/itwMocksUtils";
import { ItwPresentationCredentialCardModal } from "../ItwPresentationCredentialCardModal";

const mockSetOptions = jest.fn();

jest.mock("@react-navigation/native", () => ({
  useFocusEffect: (callback: () => void) => callback()
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({
    bottom: 0
  })
}));

jest.mock("@pagopa/io-app-design-system", () => ({
  HeaderSecondLevel: () => null,
  VSpacer: () => null,
  Tag: () => null,
  IOColors: {
    black: "#000000"
  },
  useScaleAnimation: () => ({
    onPressIn: jest.fn(),
    onPressOut: jest.fn(),
    scaleAnimatedStyle: {}
  }),
  useIOTheme: () => ({
    "appBackground-primary": "#ffffff"
  })
}));

jest.mock("../../../../../../store/hooks.ts", () => ({
  useIODispatch: () => jest.fn(),
  useIOSelector: (selector: (state: unknown) => unknown) => selector({})
}));

jest.mock("../../../../../../utils/brightness.ts", () => ({
  useMaxBrightness: jest.fn()
}));

jest.mock("../../../../../../utils/hooks/usePreventScreenCapture.ts", () => ({
  usePreventScreenCapture: jest.fn()
}));

jest.mock("../../../../common/store/selectors/preferences.ts", () => ({
  itwIsClaimValueHiddenSelector: () => false
}));

jest.mock("../../../../lifecycle/store/selectors", () => ({
  itwLifecycleIsITWalletValidSelector: () => true
}));

jest.mock("../../analytics", () => ({
  trackCredentialCardModal: jest.fn()
}));

jest.mock("../../../../analytics/utils/index.ts", () => ({
  getMixPanelCredential: jest.fn(() => "ITW_MOCK_CREDENTIAL")
}));

jest.mock(
  "../../../../common/components/ItwSkeumorphicCard/FlipGestureDetector.tsx",
  () => ({
    FlipGestureDetector: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    )
  })
);

jest.mock("react-native-reanimated", () => {
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: { View },
    createCSSAnimatedComponent: (Component: any) => Component
  };
});

jest.mock("@shopify/react-native-skia", () => ({
  Canvas: ({ children, ...props }: any) => {
    const { View } = require("react-native");
    return <View {...props}>{children}</View>;
  }
}));

jest.mock("../../../../common/components/ItwBrandedSkiaBorder.tsx", () => ({
  ItwBrandedSkiaBorder: () => null
}));

jest.mock(
  "../../../../common/components/ItwSkeumorphicCard/CardBackground.tsx",
  () => ({
    CardBackground: () => null
  })
);

jest.mock(
  "../../../../common/components/ItwSkeumorphicCard/CardData.tsx",
  () => ({
    CardData: () => null
  })
);

const readFlippableTransforms = (component: ReturnType<typeof render>) => {
  const flippableFaces = component.UNSAFE_root.findAll(node => {
    const transform = StyleSheet.flatten(node.props?.style)?.transform;
    return (
      Array.isArray(transform) &&
      transform.some(
        step => !!step && typeof step === "object" && "rotateY" in step
      )
    );
  });

  return flippableFaces.map(
    face => StyleSheet.flatten(face.props.style).transform
  );
};

jest.mock(
  "../../components/ItwPresentationCredentialCardFlipButton.tsx",
  () => ({
    ItwPresentationCredentialCardFlipButton: ({
      handleOnPress
    }: {
      handleOnPress: () => void;
    }) => {
      const { Pressable } = require("react-native");
      return (
        <Pressable
          testID="flip-button"
          onPress={handleOnPress}
          accessibilityRole="button"
          accessibilityLabel="Flip credential card"
        />
      );
    }
  })
);

jest.mock(
  "../../components/ItwPresentationCredentialCardHideValuesButton.tsx",
  () => ({
    ItwPresentationCredentialCardHideValuesButton: () => null
  })
);

describe("ItwPresentationCredentialCardModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("keeps the outer 90deg rotation and updates flippable transforms with perspective", () => {
    const component = render(
      <ItwPresentationCredentialCardModal
        route={{
          key: "modal",
          name: "ITW_PRESENTATION_CREDENTIAL_CARD_MODAL",
          params: {
            credential: ItwStoredCredentialsMocks.mdl,
            status: "valid"
          }
        }}
        navigation={
          {
            setOptions: mockSetOptions,
            goBack: jest.fn()
          } as any
        }
      />
    );

    const cardAreaCandidates = component.UNSAFE_root.findAll(
      node =>
        typeof node.props?.onLayout === "function" &&
        StyleSheet.flatten(node.props?.style)?.justifyContent === "center" &&
        StyleSheet.flatten(node.props?.style)?.alignItems === "center"
    );
    expect(cardAreaCandidates.length).toBeGreaterThan(0);
    cardAreaCandidates.forEach(cardArea => {
      fireEvent(cardArea, "layout", {
        nativeEvent: { layout: { height: 300 } }
      });
    });

    const rotatedContainers = component.UNSAFE_root.findAll(
      node =>
        !!node.props?.style &&
        StyleSheet.flatten(node.props.style)?.transform?.some(
          (transform: Record<string, string>) => transform.rotate === "90deg"
        )
    );
    expect(rotatedContainers.length).toBeGreaterThan(0);
    const [rotatedContainer] = rotatedContainers;

    expect(StyleSheet.flatten(rotatedContainer.props.style)?.transform).toEqual(
      [{ rotate: "90deg" }]
    );
    expect(readFlippableTransforms(component)).toEqual(
      expect.arrayContaining([
        [{ perspective: 1000 }, { rotateY: "0deg" }],
        [{ perspective: 1000 }, { rotateY: "180deg" }]
      ])
    );

    fireEvent.press(component.getByTestId("flip-button"));

    expect(readFlippableTransforms(component)).toEqual(
      expect.arrayContaining([
        [{ perspective: 1000 }, { rotateY: "180deg" }],
        [{ perspective: 1000 }, { rotateY: "360deg" }]
      ])
    );
  });
});
