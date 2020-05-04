import { BugReporting } from "instabug-reactnative";
import { Content, H3, Text, View } from "native-base";
import * as React from "react";
import {
  InteractionManager,
  Modal,
  ModalBaseProps,
  StyleSheet,
  TouchableWithoutFeedback
} from "react-native";
import I18n from "../i18n";
import themeVariables from "../theme/variables";
import customVariables from "../theme/variables";
import { FAQsCategoriesType } from "../utils/faq";
import FAQComponent from "./FAQComponent";
import InstabugAssistanceComponent from "./InstabugAssistanceComponent";
import BaseScreenComponent from "./screens/BaseScreenComponent";
import BetaBannerComponent from "./screens/BetaBannerComponent";
import ActivityIndicator from "./ui/ActivityIndicator";
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
    flexGrow: 1,
    justifyContent: "space-between"
  },
  header: {
    height: customVariables.appHeaderHeight,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignContent: "center",
    paddingHorizontal: customVariables.contentPadding
  },
  flex: {
    flex: 1
  },
  padded: {
    paddingHorizontal: customVariables.contentPadding
  },
  white: {
    backgroundColor: customVariables.colorWhite
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
        <BaseScreenComponent
          customRightBack={{ iconName: "io-close", onPress: onClose }}
        >
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
              <View style={styles.padded}>
                <H3>{this.props.title}</H3>
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
              </View>
              <View spacer={true} extralarge={true} />
              {this.props.contentLoaded && <BetaBannerComponent />}
            </Content>
          )}
        </BaseScreenComponent>
      </Modal>
    );
  }
}
