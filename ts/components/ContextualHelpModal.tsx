import { Container, Content, H3, View } from "native-base";
import * as React from "react";
import {
  InteractionManager,
  Modal,
  SafeAreaView,
  StyleSheet
} from "react-native";
import { isIphoneX } from "react-native-iphone-x-helper";
import IconFont from "../components/ui/IconFont";
import themeVariables from "../theme/variables";
import customVariables from "../theme/variables";
import { FOOTER_SAFE_AREA } from "../utils/constants";
import { FAQsCategoriesType } from "../utils/faq";
import ButtonDefaultOpacity from "./ButtonDefaultOpacity";
import FAQComponent from "./FAQComponent";
import BetaBannerComponent from "./screens/BetaBannerComponent";
import ActivityIndicator from "./ui/ActivityIndicator";

type Props = Readonly<{
  title: string;
  body: () => React.ReactNode;
  contentLoaded: boolean;
  isVisible: boolean;
  close: () => void;
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
  iphoneXBottom: {
    marginBottom: FOOTER_SAFE_AREA
  },
  flex: {
    flex: 1
  },
  padded: {
    paddingHorizontal: customVariables.contentPadding
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

    const simpleHeader = (
      <View style={styles.header}>
        <ButtonDefaultOpacity onPress={onClose}>
          <IconFont name={"io-close"} />
        </ButtonDefaultOpacity>
      </View>
    );

    return (
      <Modal
        visible={this.props.isVisible}
        onShow={onModalShow}
        animationType={"slide"}
        transparent={true}
        onRequestClose={onClose}
      >
        <SafeAreaView style={styles.flex}>
          <Container style={isIphoneX() ? styles.iphoneXBottom : undefined}>
            {simpleHeader}
            <Content noPadded={true}>
              <View style={styles.padded}>
                <H3>{this.props.title}</H3>

                {this.state.content || (
                  <ActivityIndicator color={themeVariables.brandPrimaryLight} />
                )}

                {this.props.faqCategories && (
                  <React.Fragment>
                    <View spacer={true} extralarge={true} />
                    <FAQComponent faqCategories={this.props.faqCategories} />
                  </React.Fragment>
                )}
              </View>
              <View spacer={true} large={true} />
              {this.state.content && <BetaBannerComponent />}
            </Content>
          </Container>
        </SafeAreaView>
      </Modal>
    );
  }
}
