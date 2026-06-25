import {
  HeaderActionProps,
  HeaderSecondLevel,
  IOIcons
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { ComponentProps, useMemo } from "react";

import {
  SupportRequestParams,
  useStartSupportRequest
} from "./useStartSupportRequest";

export type BackProps =
  | {
      backAccessibilityLabel: string;
      goBack: () => void;
    }
  | {
      backAccessibilityLabel?: never;
      goBack?: never;
    };
export type HeaderActionsProps =
  | HeaderHelpActionProps
  | HeaderNoActionProps
  | HeaderThreeActionsProps
  | HeaderTwoActionsProps;

type HeaderBaseProps = {
  headerType?: Exclude<HeaderSecondLevelProps["type"], "base" | "singleAction">;
  showHelp?: boolean;
};

interface HeaderHelpActionProps extends HeaderBaseProps {
  headerType?: never;
  secondAction?: never;
  showHelp: true;
  thirdAction?: never;
}

interface HeaderNoActionProps extends HeaderBaseProps {
  headerType?: never;
  secondAction?: never;
  showHelp?: false;
  thirdAction?: never;
}

type HeaderProps = BackProps &
  HeaderActionsProps &
  Pick<HeaderSecondLevelProps, "scrollValues" | "title"> &
  SupportRequestParams;

type HeaderSecondLevelProps = ComponentProps<typeof HeaderSecondLevel>;

interface HeaderThreeActionsProps extends HeaderBaseProps {
  headerType: "threeActions";
  secondAction: HeaderActionProps;
  showHelp: true;
  thirdAction: HeaderActionProps;
}

interface HeaderTwoActionsProps extends HeaderBaseProps {
  headerType: "twoActions";
  secondAction: HeaderActionProps;
  showHelp: true;
  thirdAction?: never;
}

export const useHeaderProps = ({
  backAccessibilityLabel,
  goBack,
  title,
  headerType,
  scrollValues,
  contextualHelp,
  contextualHelpMarkdown,
  faqCategories,
  showHelp,
  secondAction,
  thirdAction
}: HeaderProps): HeaderSecondLevelProps => {
  const startSupportRequest = useStartSupportRequest({
    contextualHelp,
    contextualHelpMarkdown,
    faqCategories
  });
  return useMemo(() => {
    const baseHeaderProps = {
      goBack,
      scrollValues,
      title,
      backAccessibilityLabel
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
      } as HeaderSecondLevelProps;
    }
    if (headerType === "twoActions") {
      return {
        ...baseHeaderProps,
        type: "twoActions",
        firstAction: baseHelpAction,
        secondAction
      } as HeaderSecondLevelProps;
    } else if (headerType === "threeActions") {
      return {
        ...baseHeaderProps,
        type: "threeActions",
        firstAction: baseHelpAction,
        secondAction,
        thirdAction
      } as HeaderSecondLevelProps;
    }
    return {
      ...baseHeaderProps,
      type: "singleAction",
      firstAction: baseHelpAction
    } as HeaderSecondLevelProps;
  }, [
    backAccessibilityLabel,
    goBack,
    headerType,
    scrollValues,
    secondAction,
    showHelp,
    startSupportRequest,
    thirdAction,
    title
  ]);
};
