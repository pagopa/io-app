import { ActionProp, HeaderSecondLevel } from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStartSupportRequest } from "../../hooks/useStartSupportRequest";
import I18n from "../../i18n";
import { FAQsCategoriesType } from "../../utils/faq";
import {
  ContextualHelpProps,
  ContextualHelpPropsMarkdown
} from "../screens/BaseScreenComponent";
import { BonusCard, BonusCardProps } from ".";

const triggerOffsetValue: number = 16;

type SupportProps = {
  faqCategories?: ReadonlyArray<FAQsCategoriesType>;
  contextualHelp?: ContextualHelpProps;
  contextualHelpMarkdown?: ContextualHelpPropsMarkdown;
};

type ScreenProps = {
  children?: React.ReactElement;
  secondAction?: ActionProp;
  thirdAction?: ActionProp;
};

export type BonusScreenComponentProps = ScreenProps &
  SupportProps &
  BonusCardProps;

const BonusCardScreenComponent = (props: BonusScreenComponentProps) => {
  const translationY = useSharedValue(0);

  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const { faqCategories, contextualHelpMarkdown, contextualHelp } = props;

  const startSupportRequest = useStartSupportRequest({
    faqCategories,
    contextualHelpMarkdown,
    contextualHelp
  });

  const scrollHandler = useAnimatedScrollHandler(event => {
    // eslint-disable-next-line functional/immutable-data
    translationY.value = event.contentOffset.y;
  });

  const headerComponentProps: React.ComponentProps<typeof HeaderSecondLevel> =
    React.useMemo(() => {
      const baseProps = {
        title: "",
        backAccessibilityLabel: I18n.t("global.buttons.back"),
        goBack: navigation.goBack
      };

      const helpAction = {
        icon: "help" as ActionProp["icon"],
        onPress: startSupportRequest,
        accessibilityLabel: I18n.t(
          "global.accessibility.contextualHelp.open.label"
        )
      };
      if (props.secondAction) {
        if (props.thirdAction) {
          // we have 3 actions changes the header props type
          return {
            ...baseProps,
            type: "threeActions",
            firstAction: helpAction,
            secondAction: props.secondAction,
            thirdAction: props.secondAction
          };
        }
        // we have 2 actions changes the header props type
        return {
          ...baseProps,
          type: "twoActions",
          firstAction: helpAction,
          secondAction: props.secondAction
        };
      }
      // we only have the support action
      return {
        ...baseProps,
        type: "singleAction",
        firstAction: helpAction
      };
    }, [props, navigation.goBack, startSupportRequest]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <HeaderSecondLevel
          scrollValues={{
            contentOffsetY: translationY,
            triggerOffset: triggerOffsetValue
          }}
          transparent={true}
          {...headerComponentProps}
        />
      ),
      headerTransparent: true
    });
  }, [navigation, translationY, headerComponentProps]);

  return (
    <Animated.ScrollView
      contentContainerStyle={{
        paddingBottom: insets.bottom
      }}
      onScroll={scrollHandler}
      scrollEventThrottle={8}
      snapToOffsets={[0, triggerOffsetValue]}
      snapToEnd={false}
      decelerationRate="normal"
    >
      <BonusCard {...props} />
      {props.children}
    </Animated.ScrollView>
  );
};

export { BonusCardScreenComponent };
