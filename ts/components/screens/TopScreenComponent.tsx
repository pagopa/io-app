import * as React from "react";
import { ComponentProps } from "../../types/react";
import { FAQsCategoriesType } from "../../utils/faq";
import { SearchType } from "../search/SearchButton";
import { AccessibilityEvents } from "./BaseHeader";
import BaseScreenComponent from "./BaseScreenComponent";

interface OwnProps {
  accessibilityLabel?: string;
  onAccessibilityNavigationHeaderFocus?: () => void;
  headerTitle?: string;
  isSearchAvailable?: boolean;
  searchType?: SearchType;
  customRightIcon?: {
    iconName: string;
    onPress: () => void;
  };
  faqCategories?: ReadonlyArray<FAQsCategoriesType>;
  accessibilityEvents?: AccessibilityEvents;
}

type BaseScreenComponentProps =
  | "dark"
  | "appLogo"
  | "goBack"
  | "contextualHelp"
  | "contextualHelpMarkdown"
  | "headerBody"
  | "customGoBack";

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
      searchType,
      customRightIcon,
      customGoBack,
      onAccessibilityNavigationHeaderFocus,
      faqCategories,
      accessibilityEvents
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
        searchType={searchType}
        customRightIcon={customRightIcon}
        customGoBack={customGoBack}
        accessibilityEvents={accessibilityEvents}
      >
        {this.props.children}
      </BaseScreenComponent>
    );
  }
}

export default TopScreenComponent;
