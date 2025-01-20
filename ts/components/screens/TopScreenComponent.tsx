import type { IOColors, IOIcons } from "@pagopa/io-app-design-system";
import { ComponentProps, PropsWithChildren, PureComponent } from "react";
import { FAQsCategoriesType } from "../../utils/faq";
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
  | "hideBaseHeader"
  | "customGoBack"
  | "isSearchAvailable"
  | "hideSafeArea";

type Props = OwnProps &
  Pick<ComponentProps<typeof BaseScreenComponent>, BaseScreenComponentProps>;

export type TopScreenComponentProps = PropsWithChildren<Props>;

/**
 * It wraps a `BaseScreenComponent` with a title and an optional subtitle
 * @deprecated This component wraps the `BaseScreenComponent` component, which is marked as deprecated.
 * Please read the `BaseScreenComponent` deprecation note to understand how to replace it.
 */
class TopScreenComponent extends PureComponent<TopScreenComponentProps> {
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
      hideBaseHeader = false,
      isSearchAvailable,
      customRightIcon,
      customGoBack,
      onAccessibilityNavigationHeaderFocus,
      faqCategories,
      accessibilityEvents,
      hideSafeArea,
      titleColor
    } = this.props;

    return (
      <BaseScreenComponent
        hideSafeArea={hideSafeArea}
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
        hideBaseHeader={hideBaseHeader}
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
