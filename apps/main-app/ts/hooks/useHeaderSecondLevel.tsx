import { HeaderActionProps, HeaderSecondLevel } from "@io-app/design-system";
import { useNavigation } from "@react-navigation/native";
import I18n from "i18next";
import { ComponentProps, useCallback, useLayoutEffect, useMemo } from "react";

import { useIOAlertVisible } from "../components/StatusMessages/IOAlertVisibleContext";
import {
  ContextualHelpProps,
  ContextualHelpPropsMarkdown
} from "../utils/contextualHelp.ts";
import { FAQsCategoriesType } from "../utils/faq";
import { useOfflineToastGuard } from "./useOfflineToastGuard.ts";
import { useStartSupportRequest } from "./useStartSupportRequest";

export type HeaderSecondLevelHookProps = PropsWithoutSupport | PropsWithSupport;

type HeaderActionConfigProps = Pick<
  ComponentProps<typeof HeaderSecondLevel>,
  "firstAction" | "secondAction" | "thirdAction" | "type"
>;

/* Tried to spread the props of the `HeaderSecondLevel` component,
but caused some type mismatches, so it's better to pick some specific
props without manually (re)declaring each prop */
type HeaderHookManagedProps = Pick<
  ComponentProps<typeof HeaderSecondLevel>,
  | "animatedRef"
  | "backAccessibilityLabel"
  | "backgroundColor"
  | "backTestID"
  | "enableDiscreteTransition"
  | "goBack"
  | "scrollValues"
  | "title"
  | "transparent"
  | "variant"
>;

type HeaderProps = ComponentProps<typeof HeaderSecondLevel>;

type NoAdditionalActions = {
  secondAction?: never;
  thirdAction?: never;
};

type PropsWithoutSupport = HeaderHookManagedProps &
  NoAdditionalActions &
  SpecificHookProps & {
    contextualHelp?: never;
    contextualHelpMarkdown?: never;
    faqCategories?: never;
    onStartSupportRequest?: never;
    supportRequest?: false;
  };

type PropsWithSupport = HeaderHookManagedProps &
  SpecificHookProps &
  WithAdditionalActions & {
    contextualHelp?: ContextualHelpProps;
    contextualHelpMarkdown?: ContextualHelpPropsMarkdown;
    faqCategories?: ReadonlyArray<FAQsCategoriesType>;
    onStartSupportRequest?: () => boolean;
    supportRequest: true;
  };

type SpecificHookProps = {
  canGoBack?: boolean;
  /* On the surface, this prop seems useless, but it's used
  to programmatically hide the header.
  See PR#5795 for more details. */
  headerShown?: boolean;
  ignoreAccessibilityCheck?: boolean;
};

type WithAdditionalActions =
  | NoAdditionalActions
  | {
      secondAction: HeaderActionProps;
      thirdAction?: HeaderActionProps;
    };

/**
 * This hook sets the `HeaderSecondLevel` in a screen using the `useLayoutEffect` hook.
 * It handles two basic use cases:
 * * With support request: the header is rendered with the (?) icon. You can configure the remaining actions.
 * * Without support request: the header is rendered just with the `Back` button.
 *
 * @param {boolean} [canGoBack=true] - Completely disable `Back` button.
 * @param {boolean} [headerShown=true] - Hide the header programmatically.
 * @param props - Props to configure the header. Not all original props are supported.
 */
export const useHeaderSecondLevel = ({
  title,
  backAccessibilityLabel,
  backTestID,
  contextualHelp,
  contextualHelpMarkdown,
  faqCategories,
  goBack,
  headerShown = true,
  canGoBack = true,
  supportRequest,
  onStartSupportRequest = () => true,
  secondAction,
  thirdAction,
  transparent = false,
  scrollValues,
  variant,
  backgroundColor,
  enableDiscreteTransition,
  ignoreAccessibilityCheck,
  animatedRef
}: HeaderSecondLevelHookProps) => {
  const { isAlertVisible } = useIOAlertVisible();
  const startSupportRequest = useOfflineToastGuard(
    useStartSupportRequest({
      faqCategories,
      contextualHelpMarkdown,
      contextualHelp
    })
  );

  // Conditionally run startSupportRequest allowing overrides with onStartSupportRequest
  const handleStartSupportRequest = useCallback(() => {
    if (onStartSupportRequest()) {
      startSupportRequest();
    }
  }, [onStartSupportRequest, startSupportRequest]);

  const navigation = useNavigation();

  const backProps = useMemo(
    () =>
      canGoBack
        ? {
            backAccessibilityLabel:
              backAccessibilityLabel ?? I18n.t("global.buttons.back"),
            backTestID,
            goBack: goBack ?? navigation.goBack
          }
        : {},
    [canGoBack, backAccessibilityLabel, backTestID, goBack, navigation.goBack]
  );

  const graphicProps = useMemo(() => {
    const enableDiscreteTransitionProps =
      enableDiscreteTransition && animatedRef
        ? {
            enableDiscreteTransition,
            animatedRef
          }
        : {};

    return {
      scrollValues,
      variant,
      backgroundColor,
      ignoreSafeAreaMargin: isAlertVisible,
      ...enableDiscreteTransitionProps
    };
  }, [
    isAlertVisible,
    enableDiscreteTransition,
    animatedRef,
    scrollValues,
    variant,
    backgroundColor
  ]);

  const helpProps: HeaderActionConfigProps = useMemo(() => {
    if (!supportRequest) {
      return {
        type: "base"
      };
    }

    const helpAction: HeaderActionProps = {
      icon: "help",
      onPress: handleStartSupportRequest,
      accessibilityLabel: I18n.t(
        "global.accessibility.contextualHelp.open.label"
      )
    };

    // Three actions
    if (secondAction && thirdAction) {
      return {
        type: "threeActions",
        firstAction: helpAction,
        secondAction,
        thirdAction
      };
    }

    // Two actions
    if (secondAction) {
      return {
        type: "twoActions",
        firstAction: helpAction,
        secondAction
      };
    }

    // Just `Help` action
    return {
      type: "singleAction",
      firstAction: helpAction
    };
  }, [supportRequest, handleStartSupportRequest, secondAction, thirdAction]);

  const headerComponentProps = useMemo(
    () => ({
      title,
      ignoreAccessibilityCheck,
      ...graphicProps,
      ...backProps,
      ...helpProps
    }),
    [title, ignoreAccessibilityCheck, graphicProps, backProps, helpProps]
  ) as HeaderProps;

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <HeaderSecondLevel
          {...headerComponentProps}
          ignoreAccessibilityCheck
          transparent={transparent}
        />
      ),
      headerShown,
      headerTransparent: transparent
    });
  }, [headerComponentProps, headerShown, navigation, transparent]);
};
