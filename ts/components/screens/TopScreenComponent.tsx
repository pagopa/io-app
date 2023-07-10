import * as React from "react";
import { ComponentProps } from "../../types/react";
import { FAQsCategoriesType } from "../../utils/faq";
import type { IOColors } from "../core/variables/IOColors";
import type { IOIcons } from "../core/icons";
import { AccessibilityEvents } from "./BaseHeader";
import BaseScreenComponent from "./BaseScreenComponent";

interface OwnProps {
  accessibilityLabel?: string;
  onAccessibilityNavigationHeaderFocus?: () => void;
  headerTitle?: string;
  customRightIcon?: {
    iconName: IOIcons;
    onPress: () => void;
    accessibilityLabel: string;
  };
  faqCategories?: ReadonlyArray<FAQsCategoriesType>;
  accessibilityEvents?: AccessibilityEvents;
  titleColor?: IOColors;
}

type BaseScreenComponentProps =
  | "dark"
  | "appLogo"
  | "goBack"
  | "contextualHelp"
  | "contextualHelpMarkdown"
  | "headerBody"
  | "customGoBack"
  | "isSearchAvailable";

type Props = OwnProps &
  Pick<ComponentProps<typeof BaseScreenComponent>, BaseScreenComponentProps>;

export type TopScreenComponentProps = Props;

/**
 * Wraps a BaseScreenComponent with a title and a subtitle
 */
class TopScreenComponent extends React.PureComponent<Props> {
  public render() {
    const {
      dark,
      appLogo,
      goBack,
      headerTitle,
      accessibilityLabel,
      contextualHelp,
      contextualHelpMarkdown,
      headerBody,
      isSearchAvailable,
      customRightIcon,
      customGoBack,
      onAccessibilityNavigationHeaderFocus,
      faqCategories,
      accessibilityEvents,
      titleColor
    } = this.props;

    return (
      <BaseScreenComponent
        onAccessibilityNavigationHeaderFocus={
          onAccessibilityNavigationHeaderFocus
        }
        accessibilityLabel={accessibilityLabel}
        appLogo={appLogo}
        dark={dark}
        goBack={goBack}
        headerTitle={goBack ? headerTitle : undefined}
        contextualHelp={contextualHelp}
        contextualHelpMarkdown={contextualHelpMarkdown}
        faqCategories={faqCategories}
        headerBody={headerBody}
        isSearchAvailable={isSearchAvailable}
        customRightIcon={customRightIcon}
        customGoBack={customGoBack}
        accessibilityEvents={accessibilityEvents}
        titleColor={titleColor}
      >
        {this.props.children}
      </BaseScreenComponent>
    );
  }
}

export default TopScreenComponent;
