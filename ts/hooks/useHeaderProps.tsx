import {
  ActionProp,
  HeaderSecondLevel,
  IOIcons
} from "@pagopa/io-app-design-system";
import { ComponentProps, useMemo } from "react";
import I18n from "../i18n";
import {
  SupportRequestParams,
  useStartSupportRequest
} from "./useStartSupportRequest";

type HeaderSecondLevelProps = ComponentProps<typeof HeaderSecondLevel>;
type HeaderBaseProps = {
  headerType?: Exclude<HeaderSecondLevelProps["type"], "base" | "singleAction">;
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

export type HeaderActionProps =
  | HeaderNoActionProps
  | HeaderHelpActionProps
  | HeaderTwoActionsProps
  | HeaderThreeActionsProps;

type HeaderProps = HeaderActionProps &
  Pick<
    HeaderSecondLevelProps,
    "title" | "scrollValues" | "backAccessibilityLabel" | "goBack"
  > &
  SupportRequestParams;

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
