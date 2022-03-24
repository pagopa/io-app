import { fromNullable } from "fp-ts/lib/Option";
import { Millisecond } from "italia-ts-commons/lib/units";
import { Container } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import React, {
  ComponentProps,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useState
} from "react";
import { ColorValue } from "react-native";
import { useDispatch } from "react-redux";
import { TranslationKeys } from "../../../../locales/locales";
import { useNavigationContext } from "../../../utils/hooks/useOnFocus";
import ContextualHelp, { RequestAssistancePayload } from "../../ContextualHelp";
import { SearchType } from "../../search/SearchButton";
import { AccessibilityEvents, BaseHeader } from "../BaseHeader";
import { zendeskSupportStart } from "../../../features/zendesk/store/actions";
import { useIOSelector } from "../../../store/hooks";
import { assistanceToolConfigSelector } from "../../../store/reducers/backendStatus";
import { assistanceToolRemoteConfig } from "../../../utils/supportAssistance";
import { ToolEnum } from "../../../../definitions/content/AssistanceToolConfig";
import { canShowHelpSelector } from "../../../store/reducers/assistanceTools";

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
  // As of now, the following prop is propagated through 4 levels
  // to finally display a checkbox in SendSupportRequestOptions
  shouldAskForScreenshotWithInitialValue?: boolean;
}

export type Props = PropsWithChildren<
  OwnProps &
    ComponentProps<typeof BaseHeader> &
    Pick<ComponentProps<typeof ContextualHelp>, "faqCategories">
>;

const ANDROID_OPEN_REPORT_DELAY = 50 as Millisecond;

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

    // used to trigger the side-effect base on timeout to take the screenshot
    const [requestAssistanceData, setRequestAssistanceData] = useState<{
      payload: RequestAssistancePayload;
    } | null>(null);

    useEffect(() => {
      if (requestAssistanceData) {
        // since in Android we have no way to handle Modal onDismiss event https://reactnative.dev/docs/modal#ondismiss
        // we force handling here. The timeout is due to wait until the modal is completely hidden
        // otherwise in the Instabug screenshot we will see the contextual help content instead the screen below
        // TODO: To complete the porting to 0.63.x, both iOS and Android will use the timeout. https://www.pivotaltracker.com/story/show/174195300
        setTimeout(() => {
          setRequestAssistanceData(null);
        }, ANDROID_OPEN_REPORT_DELAY);
      }
    }, [requestAssistanceData]);

    const dispatch = useDispatch();
    const assistanceToolConfig = useIOSelector(assistanceToolConfigSelector);
    const canShowHelp = useIOSelector(canShowHelpSelector);

    const choosenTool = assistanceToolRemoteConfig(assistanceToolConfig);

    const onShowHelp = (): (() => void) | undefined => {
      switch (choosenTool) {
        case ToolEnum.zendesk:
          // The navigation param assistanceForPayment is fixed to false because in this entry point we don't know the category yet.
          return () => {
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
        case ToolEnum.none:
        case ToolEnum.web:
          return undefined;
        default:
          return undefined;
      }
    };

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
          onShowHelp={canShowHelp ? onShowHelp() : undefined}
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
