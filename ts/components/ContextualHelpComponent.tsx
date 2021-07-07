import { BugReporting } from "instabug-reactnative";
import { Content, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import I18n from "../i18n";
import themeVariables from "../theme/variables";
import { ContextualHelpData } from "./ContextualHelpModal";
import { H3 } from "./core/typography/H3";
import FAQComponent from "./FAQComponent";
import InstabugAssistanceComponent from "./InstabugAssistanceComponent";
import { BaseHeader } from "./screens/BaseHeader";
import BetaBannerComponent from "./screens/BetaBannerComponent";
import { EdgeBorderComponent } from "./screens/EdgeBorderComponent";
import ActivityIndicator from "./ui/ActivityIndicator";

const styles = StyleSheet.create({
  contentContainer: {
    padding: themeVariables.contentPadding
  }
});

type Props = {
  onClose: () => void;
  contextualHelpData: ContextualHelpData;
  isContentLoaded: boolean | undefined;
  onLinkClicked?: (url: string) => void;
  onRequestAssistance: (reportType: BugReporting.reportType) => void;
};

const ContextualHelpComponent: React.FunctionComponent<Props> = ({
  onClose,
  contextualHelpData,
  isContentLoaded,
  onLinkClicked,
  onRequestAssistance
}) => {
  // Being content a ReactNode we can rely on `null` to represent no-content
  const showLoader = contextualHelpData.content === undefined;

  return (
    <>
      <BaseHeader
        accessibilityEvents={{
          avoidNavigationEventsUsage: true
        }}
        headerTitle={I18n.t("contextualHelp.title")}
        customRightIcon={{
          iconName: "io-close",
          onPress: onClose,
          accessibilityLabel: I18n.t(
            "global.accessibility.contextualHelp.close"
          )
        }}
      />
      {showLoader && (
        <View centerJustified={true}>
          <ActivityIndicator color={themeVariables.brandPrimaryLight} />
        </View>
      )}
      {!showLoader && (
        <Content
          contentContainerStyle={styles.contentContainer}
          noPadded={true}
        >
          {renderTitleIfPresent(contextualHelpData.title)}
          {renderContentIfPresent(contextualHelpData.content)}

          {contextualHelpData.faqs && isContentLoaded && (
            <FAQComponent
              onLinkClicked={onLinkClicked}
              faqs={contextualHelpData.faqs}
            />
          )}
          {isContentLoaded && (
            <>
              {contextualHelpData.content !== null && (
                <View spacer={true} extralarge={true} />
              )}
              <InstabugAssistanceComponent
                requestAssistance={onRequestAssistance}
              />
            </>
          )}
          {isContentLoaded && <EdgeBorderComponent />}
        </Content>
      )}
      <BetaBannerComponent />
    </>
  );
};

function renderTitleIfPresent(title: string) {
  if (title) {
    return (
      <>
        <H3 accessible={true}>{title}</H3>
        <View spacer={true} />
      </>
    );
  }
  return null;
}

function renderContentIfPresent(content: React.ReactNode) {
  if (content === null) {
    return null;
  }

  return (
    <>
      {content}
      <View spacer={true} />
    </>
  );
}

export default ContextualHelpComponent;
