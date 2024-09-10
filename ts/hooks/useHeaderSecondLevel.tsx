import { ActionProp, HeaderSecondLevel } from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { ComponentProps, useLayoutEffect, useMemo } from "react";
import {
  ContextualHelpProps,
  ContextualHelpPropsMarkdown
} from "../components/screens/BaseScreenComponent";
import I18n from "../i18n";
import { FAQsCategoriesType } from "../utils/faq";
import { useStartSupportRequest } from "./useStartSupportRequest";

type SpecificHookProps = {
  canGoBack?: boolean;
  headerShown?: boolean;
};

type HeaderHookManagedProps = Pick<
  ComponentProps<typeof HeaderSecondLevel>,
  | "title"
  | "backAccessibilityLabel"
  | "backTestID"
  | "goBack"
  | "transparent"
  | "scrollValues"
  | "variant"
  | "backgroundColor"
  | "enableDiscreteTransition"
  | "animatedRef"
>;

type NoAdditionalActions = {
  secondAction?: never;
  thirdAction?: never;
};

type WithAdditionalActions =
  | NoAdditionalActions
  | {
      secondAction: ActionProp;
      thirdAction?: ActionProp;
    };

type PropsWithSupport = SpecificHookProps &
  HeaderHookManagedProps & {
    supportRequest: true;
    faqCategories?: ReadonlyArray<FAQsCategoriesType>;
    contextualHelp?: ContextualHelpProps;
    contextualHelpMarkdown?: ContextualHelpPropsMarkdown;
  } & WithAdditionalActions;

type PropsWithoutSupport = SpecificHookProps &
  HeaderHookManagedProps & {
    supportRequest?: false;
    faqCategories?: never;
    contextualHelp?: never;
    contextualHelpMarkdown?: never;
  } & NoAdditionalActions;

export type HeaderSecondLevelHookProps = PropsWithSupport | PropsWithoutSupport;

type HeaderProps = ComponentProps<typeof HeaderSecondLevel>;

/**
 * A hook to set the header of a second level screen with useLayoutEffect hook
 * this hook only handles 2 basic cases of the header, with or without support request
 * rendering only the singleAction scenario of the header, in case of multiple actions it is needed to develop a custom header.
 * @param props
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
  secondAction,
  thirdAction,
  transparent = false,
  scrollValues,
  variant,
  backgroundColor,
  enableDiscreteTransition,
  animatedRef
}: HeaderSecondLevelHookProps) => {
  const startSupportRequest = useStartSupportRequest({
    faqCategories,
    contextualHelpMarkdown,
    contextualHelp
  });

  const navigation = useNavigation();

  const headerComponentProps: HeaderProps = useMemo(() => {
    const backProps = canGoBack
      ? {
          backAccessibilityLabel:
            backAccessibilityLabel ?? I18n.t("global.buttons.back"),
          backTestID,
          goBack: goBack ?? navigation.goBack
        }
      : {};

    const enableDiscreteTransitionProps =
      enableDiscreteTransition && animatedRef
        ? {
            enableDiscreteTransition,
            animatedRef
          }
        : {};

    const graphicProps = {
      scrollValues,
      variant,
      backgroundColor
    };

    const baseProps = {
      title,
      ...graphicProps,
      ...backProps,
      ...enableDiscreteTransitionProps
    };

    if (supportRequest) {
      const helpAction = {
        icon: "help" as ActionProp["icon"],
        onPress: startSupportRequest,
        accessibilityLabel: I18n.t(
          "global.accessibility.contextualHelp.open.label"
        )
      };
      if (secondAction) {
        if (thirdAction) {
          // we have 3 actions changes the header props type
          return {
            ...baseProps,
            type: "threeActions",
            firstAction: helpAction,
            secondAction,
            thirdAction
          };
        }
        // we have 2 actions changes the header props type
        return {
          ...baseProps,
          type: "twoActions",
          firstAction: helpAction,
          secondAction
        };
      }
      // we only have the support action
      return {
        ...baseProps,
        type: "singleAction",
        firstAction: helpAction
      };
    }

    // no further actions only back button handling
    return {
      ...baseProps,
      type: "base"
    };
  }, [
    canGoBack,
    backAccessibilityLabel,
    backTestID,
    goBack,
    navigation.goBack,
    enableDiscreteTransition,
    animatedRef,
    scrollValues,
    variant,
    backgroundColor,
    title,
    supportRequest,
    startSupportRequest,
    secondAction,
    thirdAction
  ]);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <HeaderSecondLevel
          {...headerComponentProps}
          transparent={transparent}
        />
      ),
      headerShown,
      headerTransparent: transparent
    });
  }, [
    headerComponentProps,
    headerShown,
    navigation,
    transparent,
    scrollValues,
    variant,
    backgroundColor
  ]);
};
