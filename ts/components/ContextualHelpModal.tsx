import I18n from "i18n-js";
import {
  Body,
  Container,
  Content,
  H1,
  H3,
  Right,
  Text,
  View
} from "native-base";
import * as React from "react";
import {
  InteractionManager,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback
} from "react-native";
import IconFont from "../components/ui/IconFont";
import themeVariables from "../theme/variables";
import { ioItaliaLink } from "../utils/deepLink";
import { FAQsCategoriesType } from "../utils/faq";
import ButtonDefaultOpacity from "./ButtonDefaultOpacity";
import FAQComponent from "./FAQComponent";
import InstabugButtonsComponent from "./InstabugButtonsComponent";
import BetaBannerComponent from "./screens/BetaBannerComponent";
import ActivityIndicator from "./ui/ActivityIndicator";
import AppHeader from "./ui/AppHeader";
import { openLink } from "./ui/Markdown/handlers/link";

type Props = Readonly<{
  title: string;
  body: () => React.ReactNode;
  isVisible: boolean;
  close: () => void;
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

/**
 * This component shows a contextual help
 * using the Modal component
 * that provides additional information when
 * needed (e.g. ToS, explaining why fees are
 * needed)
 */
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
        animationType={"slide"}
        onRequestClose={onClose}
      >
        <Container>
          <AppHeader noLeft={true}>
            <Body />
            <Right>
              <ButtonDefaultOpacity onPress={onClose} transparent={true}>
                <IconFont name={"io-close"} />
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
              <H1>{this.props.title}</H1>
              <View spacer={true} />
              
              {this.state.content}

              <View spacer={true} extralarge={true} />
              
              {this.props.faqCategories && (
                <FAQComponent faqCategories={this.props.faqCategories} />
              )}
              
              <View spacer={true} extralarge={true} />

              <InstabugButtonsComponent hideComponent={this.props.close} />
              <View spacer={true} extralarge={true} />
              <H3>{I18n.t("instabug.contextualHelp.title2")}</H3>
              <View spacer={true} />
              <View spacer={true} extrasmall={true} />
              <Text>
                {`${I18n.t("instabug.contextualHelp.descriptionLink")} `}
                <TouchableWithoutFeedback
                  onPress={() => openLink(ioItaliaLink)}
                >
                  <Text link={true}>{I18n.t("global.ioURL")}</Text>
                </TouchableWithoutFeedback>
              </Text>
              <View spacer={true} extralarge={true} />
            </Content>
          )}
          <BetaBannerComponent />
        </Container>
      </Modal>
    );
  }
}
