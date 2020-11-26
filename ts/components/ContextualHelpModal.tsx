import { fromNullable, none } from "fp-ts/lib/Option";
import { BugReporting } from "instabug-reactnative";
import * as pot from "italia-ts-commons/lib/pot";
import { Container, Content, H3, View } from "native-base";
import * as React from "react";
import {
  InteractionManager,
  Modal,
  ModalBaseProps,
  StyleSheet
} from "react-native";
import { connect } from "react-redux";
import I18n from "../i18n";
import { loadContextualHelpData } from "../store/actions/content";
import { Dispatch } from "../store/actions/types";
import { screenContextualHelpDataSelector } from "../store/reducers/content";
import { GlobalState } from "../store/reducers/types";
import themeVariables from "../theme/variables";
import {
  FAQsCategoriesType,
  FAQType,
  getFAQsFromCategories
} from "../utils/faq";
import FAQComponent from "./FAQComponent";
import InstabugAssistanceComponent from "./InstabugAssistanceComponent";
import { BaseHeader } from "./screens/BaseHeader";
import BetaBannerComponent from "./screens/BetaBannerComponent";
import { EdgeBorderComponent } from "./screens/EdgeBorderComponent";
import ActivityIndicator from "./ui/ActivityIndicator";
import Markdown from "./ui/Markdown";

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

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  OwnProps;

const styles = StyleSheet.create({
  contentContainerStyle: {
    padding: themeVariables.contentPadding
  }
});

type ContextualHelpData = {
  title: string;
  content: React.ReactNode;
  faqs?: ReadonlyArray<FAQType>;
};

/**
 * A modal to show the contextual help reelated to a screen.
 * The contextual help is characterized by:
 * - a title
 * - a textual or a component containing the screen description
 * - [optional] if on SPID authentication once the user selected an idp, content to link the support desk of the selected identity provider
 * - a list of questions and answers. They are selected by the component depending on the cathegories passed to the component
 *
 * Optionally, the title and the content are injected from the content presented in the related clinet response.
 */
const ContextualHelpModal: React.FunctionComponent<Props> = (props: Props) => {
  const [content, setContent] = React.useState<React.ReactNode>(null);
  const [contentLoaded, setContentLoaded] = React.useState<boolean | undefined>(
    undefined
  );

  React.useEffect(() => {
    // if the contextual data is empty or is in error -> try to reload
    if (
      !pot.isLoading(props.potContextualData) &&
      pot.isNone(props.potContextualData) &&
      pot.isError(props.potContextualData)
    ) {
      props.loadContextualHelpData();
    }
  }, [
    pot.isNone(props.potContextualData) || pot.isError(props.potContextualData)
  ]);

  // after the modal is fully visible, render the content -
  // in case of complex markdown this can take some time and we don't
  // want to impact the modal animation
  const onModalShow = () => setContent(props.body());

  // on close, we set a handler to cleanup the content after all
  // interactions (animations) are complete
  const onClose = () => {
    void InteractionManager.runAfterInteractions(() => setContent(null));
    props.close();
  };

  /**
   *  If contextualData (loaded from the content server) contains the route of the current screen,
   *  title, content, faqs are read from it, otherwise they came from the locales stored in app
   */
  const contextualHelpData = props.maybeContextualData.fold<ContextualHelpData>(
    {
      title: props.title,
      faqs: getFAQsFromCategories(props.faqCategories ?? []),
      content
    },
    data => {
      const content = (
        <Markdown onLoadEnd={() => setContentLoaded(true)}>
          {data.content}
        </Markdown>
      );
      const faqs = fromNullable(data.faqs)
        // ensure the array is defined and not empty
        .mapNullable(faqs => (faqs.length > 0 ? faqs : undefined))
        // if remote faqs are not defined or empty, fallback to the local ones
        .fold(getFAQsFromCategories(props.faqCategories ?? []), fqs =>
          fqs.map(f => ({ title: f.title, content: f.body }))
        );
      return { title: data.title, content, faqs };
    }
  );

  // content is loaded is when:
  // - provided one from props is loaded or
  // - when the remote one is loaded
  const isContentLoaded = props.maybeContextualData.fold(
    props.contentLoaded,
    _ => contentLoaded
  );

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

        {!contextualHelpData.content && (
          <View centerJustified={true}>
            <ActivityIndicator color={themeVariables.brandPrimaryLight} />
          </View>
        )}
        {contextualHelpData.content && (
          <Content
            contentContainerStyle={styles.contentContainerStyle}
            noPadded={true}
          >
            <H3 accessible={true}>{contextualHelpData.title}</H3>
            <View spacer={true} />
            {contextualHelpData.content}
            <View spacer={true} />
            {contextualHelpData.faqs && isContentLoaded && (
              <FAQComponent
                onLinkClicked={props.onLinkClicked}
                faqs={contextualHelpData.faqs}
              />
            )}
            {isContentLoaded && (
              <React.Fragment>
                <View spacer={true} extralarge={true} />
                <InstabugAssistanceComponent
                  requestAssistance={props.onRequestAssistance}
                />
              </React.Fragment>
            )}
            {isContentLoaded && <EdgeBorderComponent />}
          </Content>
        )}
        <BetaBannerComponent />
      </Container>
    </Modal>
  );
};

const mapStateToProps = (state: GlobalState) => {
  const potContextualData = screenContextualHelpDataSelector(state);
  const maybeContextualData = pot.getOrElse(potContextualData, none);
  return {
    potContextualData,
    maybeContextualData
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadContextualHelpData: () => dispatch(loadContextualHelpData.request())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContextualHelpModal);
