import {
  ActionProp,
  H3,
  HeaderSecondLevel,
  IOIcons,
  IOVisualCostants
} from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import React, {
  ComponentProps,
  useLayoutEffect,
  useMemo,
  useState
} from "react";
import { LayoutChangeEvent, View } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  SupportRequestParams,
  useStartSupportRequest
} from "../../hooks/useStartSupportRequest";
import I18n from "../../i18n";

type HeaderBaseProps = {
  headerType?: Exclude<
    ComponentProps<typeof HeaderSecondLevel>["type"],
    "base" | "singleAction"
  >;
  showHelp?: boolean;
};

interface HeaderNoActionProps extends HeaderBaseProps {
  showHelp?: false;
  headerType?: never;
  secondAction?: never;
  thirdAction?: never;
}

interface HeaderHelpActionProps extends HeaderBaseProps {
  showHelp: true;
  headerType?: never;
  secondAction?: never;
  thirdAction?: never;
}

interface HeaderTwoActionsProps extends HeaderBaseProps {
  showHelp: true;
  headerType: "twoActions";
  secondAction: ActionProp;
  thirdAction?: never;
}

interface HeaderThreeActionsProps extends HeaderBaseProps {
  showHelp: true;
  headerType: "threeActions";
  secondAction: ActionProp;
  thirdAction: ActionProp;
}

type HeaderProps =
  | HeaderNoActionProps
  | HeaderHelpActionProps
  | HeaderTwoActionsProps
  | HeaderThreeActionsProps;

type Props = {
  children: React.ReactNode;
  title: string;
} & SupportRequestParams &
  HeaderProps;

/**
 * A screen with a large header that can be used as a template for other screens.
 * It also handles the contextual help and the faq. The usage of LargeHeader naming is due to a similar behaviour
 * offered by react-navigation/native-stack, referencing the native API from iOS platform.
 * @param children
 * @param title
 * @param contextualHelp
 * @param contextualHelpMarkdown
 * @param faqCategories
 * @param headerProps
 */
export const RNavScreenWithLargeHeader = ({
  children,
  title,
  contextualHelp,
  contextualHelpMarkdown,
  faqCategories,
  showHelp = true,
  headerType,
  secondAction,
  thirdAction
}: Props) => {
  const [titleHeight, setTitleHeight] = useState(0);
  const translationY = useSharedValue(0);

  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const startSupportRequest = useStartSupportRequest({
    contextualHelp,
    contextualHelpMarkdown,
    faqCategories
  });
  const getTitleHeight = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setTitleHeight(height);
  };

  const scrollHandler = useAnimatedScrollHandler(event => {
    // eslint-disable-next-line functional/immutable-data
    translationY.value = event.contentOffset.y;
  });

  const derivedHeaderProps: ComponentProps<typeof HeaderSecondLevel> =
    useMemo(() => {
      const baseHeaderProps = {
        goBack: navigation.goBack,
        scrollValues: {
          contentOffsetY: translationY,
          triggerOffset: titleHeight
        },
        title,
        backAccessibilityLabel: I18n.t("global.buttons.back")
      };

      const baseHelpAction = {
        icon: "help" as IOIcons,
        accessibilityLabel: I18n.t(
          "global.accessibility.contextualHelp.open.label"
        ),
        onPress: startSupportRequest
      };

      if (!showHelp) {
        return {
          ...baseHeaderProps,
          type: "base"
        };
      }
      if (headerType === "twoActions") {
        return {
          ...baseHeaderProps,
          type: "twoActions",
          firstAction: baseHelpAction,
          secondAction
        };
      } else if (headerType === "threeActions") {
        return {
          ...baseHeaderProps,
          type: "threeActions",
          firstAction: baseHelpAction,
          secondAction,
          thirdAction
        };
      }
      return {
        ...baseHeaderProps,
        type: "singleAction",
        firstAction: baseHelpAction
      };
    }, [
      headerType,
      navigation.goBack,
      secondAction,
      showHelp,
      startSupportRequest,
      thirdAction,
      title,
      titleHeight,
      translationY
    ]);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => <HeaderSecondLevel {...derivedHeaderProps} />
    });
  }, [
    derivedHeaderProps,
    navigation,
    startSupportRequest,
    title,
    titleHeight,
    translationY
  ]);

  return (
    <Animated.ScrollView
      contentContainerStyle={{
        paddingBottom: insets.bottom,
        paddingHorizontal: IOVisualCostants.appMarginDefault
      }}
      onScroll={scrollHandler}
      scrollEventThrottle={8}
      snapToOffsets={[0, titleHeight]}
      snapToEnd={false}
      decelerationRate="normal"
    >
      <View onLayout={getTitleHeight}>
        <H3>{title}</H3>
      </View>
      {children}
    </Animated.ScrollView>
  );
};
