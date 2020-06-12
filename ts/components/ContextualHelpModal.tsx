import { BugReporting } from "instabug-reactnative";
import { Container, Content, H3, Text, View } from "native-base";
import * as React from "react";
import {
  InteractionManager,
  Modal,
  ModalBaseProps,
  StyleSheet,
  TouchableWithoutFeedback
} from "react-native";
import { connect } from "react-redux";
import I18n from "../i18n";
import { screenContextualHelpDataSelector } from "../store/reducers/content";
import { GlobalState } from "../store/reducers/types";
import themeVariables from "../theme/variables";
import { FAQsCategoriesType } from "../utils/faq";
import FAQComponent from "./FAQComponent";
import InstabugAssistanceComponent from "./InstabugAssistanceComponent";
import { BaseHeader } from "./screens/BaseHeader";
import BetaBannerComponent from "./screens/BetaBannerComponent";
import { EdgeBorderComponent } from "./screens/EdgeBorderComponent";
import ActivityIndicator from "./ui/ActivityIndicator";
import Markdown from "./ui/Markdown";
import { openLink } from "./ui/Markdown/handlers/link";

type OwnProps = Readonly<{
  title: string;
  body: () => React.ReactNode;
  contentLoaded: boolean;
  isVisible: boolean;
  onLinkClicked?: (url: string) => void;
  modalAnimation?: ModalBaseProps["animationType"];
  close: () => void;
  onRequestAssistance: (type: BugReporting.reportType) => void;
  faqCategories?: ReadonlyArray<FAQsCategoriesType>;
}>;

type Props = ReturnType<typeof mapStateToProps> & OwnProps;

const styles = StyleSheet.create({
  contentContainerStyle: {
    padding: themeVariables.contentPadding
  }
});

/**
 * A modal to show the contextual help reelated to a screen.
 * The contextual help is characterized by:
 * - a title
 * - a textual or a component containing the screen description
 * - [optional] if on SPID authentication once the user selected an idp, content to link the support desk of the selected identity provider
 * - a list of questions and aswers. They are selected by the component depending on the cathegories passed to the component
 *
 * Optionally, the title and the content are injected from the content presented in the related clinet response.
 */
const ContextualHelpModal: React.FunctionComponent<Props> = (props: Props) => {
  const [content, setContent] = React.useState<React.ReactNode | null>(null);

  // after the modal is fully visible, render the content -
  // in case of complex markdown this can take some time and we don't
  // want to impact the modal animation
  const onModalShow = () => setContent(props.body);

  // on close, we set a handler to cleanup the content after all
  // interactions (animations) are complete
  const onClose = () => {
    InteractionManager.runAfterInteractions(() => setContent(null));
    props.close();
  };

  /**
   *  If contextualData (loaded from the content server) contains the route of the current screen,
   *  title and content are read from it, otherwise they came from the locales sotred in app
   */
  const customizedTitle = props.contextualData.fold(
    props.title,
    data => data.title
  );
  const customizedContent = props.contextualData.fold(content, data => (
    <Markdown>{data.content}</Markdown>
  ));

  return (
    <Modal
      visible={props.isVisible}
      onShow={onModalShow}
      animationType={props.modalAnimation || "slide"}
      transparent={true}
      onDismiss={onClose}
      onRequestClose={onClose}
    >
      <Container>
        <BaseHeader
          headerTitle={I18n.t("contextualHelp.title")}
          customRightIcon={{ iconName: "io-close", onPress: onClose }}
        />

        {!content && (
          <View centerJustified={true}>
            <ActivityIndicator color={themeVariables.brandPrimaryLight} />
          </View>
        )}
        {content && (
          <Content
            contentContainerStyle={styles.contentContainerStyle}
            noPadded={true}
          >
            <H3>{customizedTitle}</H3>
            <View spacer={true} />
            {customizedContent}
            <View spacer={true} />
            {props.faqCategories &&
              props.contentLoaded && (
                <FAQComponent
                  onLinkClicked={props.onLinkClicked}
                  faqCategories={props.faqCategories}
                />
              )}
            {props.contentLoaded && (
              <React.Fragment>
                <View spacer={true} extralarge={true} />
                <InstabugAssistanceComponent
                  requestAssistance={props.onRequestAssistance}
                />
                <View spacer={true} />
                <H3>{I18n.t("instabug.contextualHelp.title2")}</H3>
                <View spacer={true} />
                <Text>
                  {`${I18n.t("instabug.contextualHelp.descriptionLink")} `}
                  <TouchableWithoutFeedback
                    onPress={() => openLink(I18n.t("global.ioWebSite"))}
                  >
                    <Text link={true}>{I18n.t("global.ioWebSite")}</Text>
                  </TouchableWithoutFeedback>
                </Text>
              </React.Fragment>
            )}
            {props.contentLoaded && <EdgeBorderComponent />}
          </Content>
        )}
        <BetaBannerComponent />
      </Container>
    </Modal>
  );
};

const mapStateToProps = (state: GlobalState) => {
  const contextualData = screenContextualHelpDataSelector(state);
  return {
    contextualData
  };
};

export default connect(mapStateToProps)(ContextualHelpModal);
