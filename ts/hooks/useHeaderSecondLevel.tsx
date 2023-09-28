import * as React from "react";
import { HeaderSecondLevel } from "@pagopa/io-app-design-system";
import { useLayoutEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { FAQsCategoriesType } from "../utils/faq";
import I18n from "../i18n";
import {
  ContextualHelpProps,
  ContextualHelpPropsMarkdown
} from "../components/screens/BaseScreenComponent";
import { useStartSupportRequest } from "./useStartSupportRequest";

type CommonProps = {
  title: string;
  backAccessibilityLabel?: string;
  goBack?: () => void;
};

type PropsWithSupport = CommonProps & {
  supportRequest: true;
  faqCategories?: ReadonlyArray<FAQsCategoriesType>;
  contextualHelp?: ContextualHelpProps;
  contextualHelpMarkdown?: ContextualHelpPropsMarkdown;
};

type PropsWithoutSupport = CommonProps & {
  supportRequest?: false;
  faqCategories?: never;
  contextualHelp?: never;
  contextualHelpMarkdown?: never;
};

export type HeaderSecondLevelHookProps = PropsWithSupport | PropsWithoutSupport;

type HeaderProps = React.ComponentProps<typeof HeaderSecondLevel>;

/**
 * A hook to set the header of a second level screen with useLayoutEffect hook
 * this hook only handles 2 basic cases of the header, with or without support request
 * rendering only the singleAction scenario of the header, in case of multiple actions it is needed to develop a custom header.
 * @param props
 */
export const useHeaderSecondLevel = ({
  title,
  backAccessibilityLabel,
  contextualHelp,
  contextualHelpMarkdown,
  faqCategories,
  goBack,
  supportRequest
}: HeaderSecondLevelHookProps) => {
  const startSupportRequest = useStartSupportRequest({
    faqCategories,
    contextualHelpMarkdown,
    contextualHelp
  });

  const navigation = useNavigation();
  const headerComponentProps: HeaderProps = React.useMemo(() => {
    const baseProps = {
      title,
      backAccessibilityLabel:
        backAccessibilityLabel ?? I18n.t("global.buttons.back"),
      goBack: goBack ?? navigation.goBack
    };

    if (supportRequest) {
      return {
        ...baseProps,
        type: "singleAction",
        firstAction: {
          icon: "help",
          onPress: startSupportRequest,
          accessibilityLabel: I18n.t(
            "global.accessibility.contextualHelp.open.label"
          )
        }
      };
    }

    return {
      ...baseProps,
      type: "base"
    };
  }, [
    title,
    backAccessibilityLabel,
    goBack,
    navigation.goBack,
    supportRequest,
    startSupportRequest
  ]);

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => <HeaderSecondLevel {...headerComponentProps} />
    });
  }, [headerComponentProps, navigation]);
};
