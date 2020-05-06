import { BugReporting } from "instabug-reactnative";
import { Body, Container, Content, H3, Right, Text, View } from "native-base";
import * as React from "react";
import {
  InteractionManager,
  Modal,
  ModalBaseProps,
  StyleSheet,
  TouchableWithoutFeedback
} from "react-native";
import IconFont from "../components/ui/IconFont";
import I18n from "../i18n";
import themeVariables from "../theme/variables";
import { FAQsCategoriesType } from "../utils/faq";
import ButtonDefaultOpacity from "./ButtonDefaultOpacity";
import FAQComponent from "./FAQComponent";
import InstabugAssistanceComponent from "./InstabugAssistanceComponent";
import BetaBannerComponent from "./screens/BetaBannerComponent";
import { EdgeBorderComponent } from "./screens/EdgeBorderComponent";
import ActivityIndicator from "./ui/ActivityIndicator";
import AppHeader from "./ui/AppHeader";
import { openLink } from "./ui/Markdown/handlers/link";

type Props = Readonly<{
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

type State = Readonly<{
  content: React.ReactNode | null;
}>;

const styles = StyleSheet.create({
  contentContainerStyle: {
    padding: themeVariables.contentPadding
  }
});

export class ContextualHelpModal extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      content: null
    };
  }

  public render(): React.ReactNode {
    // after the modal is fully visible, render the content -
    // in case of complex markdown this can take some time and we don't
    // want to impact the modal animation
    const onModalShow = () =>
      this.setState({
        content: this.props.body()
      });

    // on close, we set a handler to cleanup the content after all
    // interactions (animations) are complete
    const onClose = () => {
      InteractionManager.runAfterInteractions(() =>
        this.setState({
          content: null
        })
      );
      this.props.close();
    };

    return (
      <Modal
        visible={this.props.isVisible}
        onShow={onModalShow}
        animationType={this.props.modalAnimation || "slide"}
        transparent={true}
        onDismiss={onClose}
        onRequestClose={onClose}
      >
        <Container>
          <AppHeader noLeft={false}>
            <Body>
              <Text white={false} numberOfLines={1}>
                {I18n.t("contextualHelp.title")}
              </Text>
            </Body>
            <Right>
              <ButtonDefaultOpacity onPress={onClose} transparent={true}>
                <IconFont name="io-close" />
              </ButtonDefaultOpacity>
            </Right>
          </AppHeader>

          {!this.state.content && (
            <View centerJustified={true}>
              <ActivityIndicator color={themeVariables.brandPrimaryLight} />
            </View>
          )}
          {this.state.content && (
            <Content
              contentContainerStyle={styles.contentContainerStyle}
              noPadded={true}
            >
              <H3>{this.props.title}</H3>
              <View spacer={true} />
              {this.state.content}
              {this.props.faqCategories &&
                this.props.contentLoaded && (
                  <FAQComponent
                    onLinkClicked={this.props.onLinkClicked}
                    faqCategories={this.props.faqCategories}
                  />
                )}
              {this.props.contentLoaded && (
                <React.Fragment>
                  <View spacer={true} extralarge={true} />
                  <InstabugAssistanceComponent
                    requestAssistance={this.props.onRequestAssistance}
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
              {this.props.contentLoaded && <EdgeBorderComponent />}
            </Content>
          )}
          <View spacer={true} extralarge={true} />

          <BetaBannerComponent />
        </Container>
      </Modal>
    );
  }
}
