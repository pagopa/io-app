import { Content, H3, View } from "native-base";
import * as React from "react";
import { InteractionManager, Modal, StyleSheet } from "react-native";
import themeVariables from "../theme/variables";
import customVariables from "../theme/variables";
import { FAQsCategoriesType } from "../utils/faq";
import FAQComponent from "./FAQComponent";
import BetaBannerComponent from "./screens/BetaBannerComponent";
import ActivityIndicator from "./ui/ActivityIndicator";
import BaseScreenComponent from "./screens/BaseScreenComponent";

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
        animationType={"slide"}
        onRequestClose={onClose}
        transparent={true}
      >
        <BaseScreenComponent
          customRightIcon={{ iconName: "io-close", onPress: onClose }}
        >
          <Content
            noPadded={true}
            contentContainerStyle={styles.contentContainerStyle}
          >
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

              <View spacer={true} large={true} />
            </View>
            {this.state.content && <BetaBannerComponent />}
          </Content>
        </BaseScreenComponent>
      </Modal>
    );
  }
}
