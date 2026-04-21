import { fireEvent, render } from "@testing-library/react-native";
import { StyleSheet, type ViewStyle } from "react-native";
import type { ReactTestInstance } from "react-test-renderer";
import { ItwStoredCredentialsMocks } from "../../../../common/utils/itwMocksUtils";
import { ITW_ROUTES } from "../../../../navigation/routes";
import { ItwPresentationCredentialCard } from "../ItwPresentationCredentialCard";

const mockNavigate = jest.fn();

jest.mock("@pagopa/io-app-design-system", () => ({
  ContentWrapper: ({ children }: { children: React.ReactNode }) => {
    const { View } = require("react-native");
    return <View>{children}</View>;
  },
  VSpacer: () => null,
  VStack: ({ children }: { children: React.ReactNode }) => {
    const { View } = require("react-native");
    return <View>{children}</View>;
  },
  Tag: () => null,
  IOColors: {
    black: "#000000"
  },
  useIOTheme: () => ({
    "appBackground-primary": "black"
  }),
  useScaleAnimation: () => ({
    onPressIn: jest.fn(),
    onPressOut: jest.fn(),
    scaleAnimatedStyle: {}
  })
}));

jest.mock("../../../../../../navigation/params/AppParamsList.ts", () => ({
  useIONavigation: () => ({
    navigate: mockNavigate
  })
}));

jest.mock("../../../../../../store/hooks.ts", () => ({
  useIOSelector: (selector: (state: unknown) => unknown) => selector({})
}));

jest.mock("../../../../common/store/selectors/preferences.ts", () => ({
  itwIsClaimValueHiddenSelector: () => false
}));

jest.mock("../../../../credentials/store/selectors", () => ({
  itwCredentialStatusSelector: () => ({
    status: "valid"
  })
}));

jest.mock("../../../../lifecycle/store/selectors", () => ({
  itwLifecycleIsITWalletValidSelector: () => true
}));

jest.mock("../../hooks/useItwDisplayCredentialStatus", () => ({
  useItwDisplayCredentialStatus: () => "valid"
}));

jest.mock("../../../../common/utils/itwStyleUtils.ts", () => ({
  useThemeColorByCredentialType: () => ({
    backgroundColor: "#123456"
  })
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

type FlippableFaceStyle = ViewStyle & {
  transform?: ReadonlyArray<Record<string, string | number>>;
};

const getFlippableFaceStyle = (node: ReactTestInstance) =>
  StyleSheet.flatten<FlippableFaceStyle>(node.props?.style);

const readFlippableTransforms = (component: ReturnType<typeof render>) => {
  const flippableFaces = component.UNSAFE_root.findAll(
    (node: ReactTestInstance) => {
      const transform = getFlippableFaceStyle(node)?.transform;
      return (
        Array.isArray(transform) &&
        transform.some(
          step => !!step && typeof step === "object" && "rotateY" in step
        )
      );
    }
  );

  return flippableFaces.map(face => getFlippableFaceStyle(face)?.transform);
};

jest.mock("../ItwPresentationCredentialCardFlipButton.tsx", () => ({
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
}));

jest.mock("../../analytics", () => ({
  trackWalletShowBack: jest.fn()
}));

jest.mock("../../../../analytics/utils/index.ts", () => ({
  getMixPanelCredential: jest.fn(() => "ITW_MOCK_CREDENTIAL")
}));

describe("ItwPresentationCredentialCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("keeps perspective-based flippable transforms and inline card navigation", () => {
    const credential = ItwStoredCredentialsMocks.mdl;
    const component = render(
      <ItwPresentationCredentialCard credential={credential} />
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

    const cardButtons = component.UNSAFE_root.findAll(
      (node: ReactTestInstance) =>
        node.props?.accessibilityRole === "button" &&
        node.props?.testID !== "flip-button" &&
        typeof node.props?.onPress === "function"
    );
    expect(cardButtons).toHaveLength(1);
    fireEvent.press(cardButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.PRESENTATION.CREDENTIAL_CARD_MODAL,
      params: {
        credential,
        status: "valid"
      }
    });
  });
});
