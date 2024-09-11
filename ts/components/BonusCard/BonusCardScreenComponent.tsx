import {
  ActionProp,
  ButtonLink,
  ButtonSolid
} from "@pagopa/io-app-design-system";
import React, { ComponentProps } from "react";
import { Dimensions } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import {
  ContextualHelpProps,
  ContextualHelpPropsMarkdown
} from "../screens/BaseScreenComponent";
import { IOScrollView, IOScrollViewActions } from "../ui/IOScrollView";
import I18n from "../../i18n";
import { useStartSupportRequest } from "../../hooks/useStartSupportRequest";
import { BonusCard } from "./BonusCard";

type SupportRequestProps = {
  contextualHelp?: ContextualHelpProps;
  contextualHelpMarkdown?: ContextualHelpPropsMarkdown;
};

type BaseProps = {
  title?: string;
  headerAction?: ActionProp;
  children?: React.ReactNode;
  footerCtaPrimary?: Omit<ComponentProps<typeof ButtonSolid>, "fullWidth">;
  footerCtaSecondary?: Omit<ComponentProps<typeof ButtonLink>, "color">;
};

export type BonusScreenComponentProps = BaseProps &
  SupportRequestProps &
  BonusCard;

const scrollTriggerOffsetValue: number = 88;

const deviceScreenHeightLogoThreshold = 700;

const BonusCardScreenComponent = ({
  title,
  headerAction,
  children,
  footerCtaPrimary,
  footerCtaSecondary,
  ...cardProps
}: BonusScreenComponentProps) => {
  const navigation = useNavigation();

  const scrollTranslationY = useSharedValue(0);

  const screenHeight = Dimensions.get("window").height;
  const shouldHideLogo = screenHeight < deviceScreenHeightLogoThreshold;

  const startSupportRequest = useStartSupportRequest({});

  const footerActions = ((): IOScrollViewActions | undefined => {
    if (footerCtaPrimary && footerCtaSecondary) {
      return {
        type: "TwoButtons",
        primary: footerCtaPrimary,
        secondary: footerCtaSecondary
      };
    }
    if (footerCtaPrimary) {
      return { type: "SingleButton", primary: footerCtaPrimary };
    }
    return undefined;
  })();

  return (
    <IOScrollView
      headerConfig={{
        type: "singleAction",
        title: title || "",
        transparent: true,
        scrollValues: {
          triggerOffset: scrollTriggerOffsetValue,
          contentOffsetY: scrollTranslationY
        },
        goBack: navigation.goBack,
        backAccessibilityLabel: I18n.t("global.buttons.back"),
        firstAction: {
          icon: "help",
          onPress: startSupportRequest,
          accessibilityLabel: I18n.t(
            "global.accessibility.contextualHelp.open.label"
          )
        }
      }}
      actions={footerActions}
      includeContentMargins={false}
      snapOffset={scrollTriggerOffsetValue}
    >
      <BonusCard hideLogo={shouldHideLogo} {...cardProps} />
      {children}
    </IOScrollView>
  );
};

export { BonusCardScreenComponent };
