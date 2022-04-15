import { fromNullable } from "fp-ts/lib/Option";
import { Container } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import React, { ComponentProps, PropsWithChildren, ReactNode } from "react";
import { ColorValue } from "react-native";
import { useDispatch } from "react-redux";
import { TranslationKeys } from "../../../../locales/locales";
import { useNavigationContext } from "../../../utils/hooks/useOnFocus";
import { SearchType } from "../../search/SearchButton";
import { AccessibilityEvents, BaseHeader } from "../BaseHeader";
import { zendeskSupportStart } from "../../../features/zendesk/store/actions";
import { useIOSelector } from "../../../store/hooks";
import { assistanceToolConfigSelector } from "../../../store/reducers/backendStatus";
import {
  assistanceToolRemoteConfig,
  resetCustomFields
} from "../../../utils/supportAssistance";
import { ToolEnum } from "../../../../definitions/content/AssistanceToolConfig";
import { canShowHelpSelector } from "../../../store/reducers/assistanceTools";
import { FAQsCategoriesType } from "../../../utils/faq";

export type ContextualHelpProps = {
  title: string;
  body: () => React.ReactNode;
};

export type ContextualHelpPropsMarkdown = {
  title: TranslationKeys;
  body: TranslationKeys;
};

interface OwnProps {
  onAccessibilityNavigationHeaderFocus?: () => void;
  accessibilityEvents?: AccessibilityEvents;
  accessibilityLabel?: string;
  contextualHelp?: ContextualHelpProps;
  contextualHelpMarkdown?: ContextualHelpPropsMarkdown;
  headerBody?: React.ReactNode;
  headerBackgroundColor?: ColorValue;
  appLogo?: boolean;
  searchType?: SearchType;
  backButtonTestID?: string;
  faqCategories?: ReadonlyArray<FAQsCategoriesType>;
}

export type Props = PropsWithChildren<
  OwnProps & ComponentProps<typeof BaseHeader>
>;

const BaseScreenComponentFC = React.forwardRef<ReactNode, Props>(
  (props: Props, _) => {
    const {
      accessibilityEvents,
      accessibilityLabel,
      appLogo,
      backButtonTestID,
      children,
      contextualHelp,
      contextualHelpMarkdown,
      customGoBack,
      customRightIcon,
      dark,
      faqCategories,
      goBack,
      headerBackgroundColor,
      headerBody,
      headerTitle,
      isSearchAvailable,
      onAccessibilityNavigationHeaderFocus,
      primary,
      showChat,
      titleColor
    } = props;

    // We should check for undefined context because the BaseScreen is used also in the Modal layer, without the navigation context.
    const currentScreenName = fromNullable(useNavigationContext())
      .map(x => x.state.routeName)
      .getOrElse("n/a");

    const dispatch = useDispatch();
    const assistanceToolConfig = useIOSelector(assistanceToolConfigSelector);
    const canShowHelp = useIOSelector(canShowHelpSelector);
    const choosenTool = assistanceToolRemoteConfig(assistanceToolConfig);

    const onShowHelp = (): (() => void) | undefined => {
      switch (choosenTool) {
        case ToolEnum.zendesk:
          // The navigation param assistanceForPayment is fixed to false because in this entry point we don't know the category yet.
          return () => {
            resetCustomFields();
            dispatch(
              zendeskSupportStart({
                faqCategories,
                contextualHelp,
                contextualHelpMarkdown,
                startingRoute: currentScreenName,
                assistanceForPayment: false
              })
            );
          };
        case ToolEnum.instabug:
        case ToolEnum.web:
        case ToolEnum.none:
          return undefined;
      }
    };

    const canShowHelpButton =
      canShowHelp && (contextualHelp || contextualHelpMarkdown);

    return (
      <Container>
        <BaseHeader
          onAccessibilityNavigationHeaderFocus={
            onAccessibilityNavigationHeaderFocus
          }
          backButtonTestID={backButtonTestID}
          accessibilityEvents={accessibilityEvents}
          accessibilityLabel={accessibilityLabel}
          showChat={showChat}
          primary={primary}
          dark={dark}
          goBack={goBack}
          headerTitle={headerTitle}
          backgroundColor={headerBackgroundColor}
          onShowHelp={canShowHelpButton ? onShowHelp() : undefined}
          isSearchAvailable={isSearchAvailable}
          body={headerBody}
          appLogo={appLogo}
          customRightIcon={customRightIcon}
          customGoBack={customGoBack}
          titleColor={titleColor}
        />
        {children}
      </Container>
    );
  }
);

export default connectStyle(
  "UIComponent.BaseScreenComponent",
  {},
  mapPropsToStyleNames
)(BaseScreenComponentFC);
