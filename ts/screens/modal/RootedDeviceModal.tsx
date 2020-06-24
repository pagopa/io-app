import { Container, Content, Text, View } from "native-base";
import * as React from "react";
import { Image, Modal, SafeAreaView, StyleSheet } from "react-native";
import { withLoadingSpinner } from "../../components/helpers/withLoadingSpinner";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import { BlockButtonProps } from "../../components/ui/BlockButtons";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import Markdown from "../../components/ui/Markdown";
import I18n from "../../i18n";
import customVariables from "../../theme/variables";

type Props = {
  onContinue: () => void;
  onCancel: () => void;
};

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  main: {
    paddingTop: customVariables.contentPadding,
    paddingHorizontal: customVariables.contentPadding,
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    textAlign: "center",
    fontSize: 20
  },
  body: {
    textAlign: "center"
  },
  bold: {
    fontWeight: "bold"
  },
  image: {
    width: 66,
    height: 104
  }
});

const CSS_STYLE = `
body {
  text-align: center;
}
`;

const image = require("../../img/rooted/broken-phone.png");

const opacity = 0.9;
const markdownComponents = 1;

const RootedDeviceModal: React.FunctionComponent<Props> = (props: Props) => {
  const [markdownLoaded, setMarkdownLoaded] = React.useState(0);

  const leftButton: BlockButtonProps = {
    title: I18n.t("global.buttons.continue"),
    bordered: true,
    danger: true,
    onPress: props.onContinue
  };

  const rightButton: BlockButtonProps = {
    title: I18n.t("global.buttons.cancel"),
    primary: true,
    onPress: props.onCancel
  };

  const onMarkdownLoaded = () => {
    setMarkdownLoaded(c => Math.min(c + 1, markdownComponents));
  };

  const loaded = markdownLoaded === markdownComponents;

  const ComponentWithLoading = withLoadingSpinner(() => (
    <Modal>
      <BaseScreenComponent goBack={false}>
        <Container>
          <SafeAreaView style={styles.flex}>
            <Content>
              <View style={styles.main}>
                <Image
                  source={image}
                  resizeMode="contain"
                  style={styles.image}
                />
                <View spacer={true} large={true} />
                <Text style={styles.title} bold={true} dark={true}>
                  {I18n.t("rooted.title")}
                </Text>
              </View>
              <View spacer={true} small={true} />
              <Markdown cssStyle={CSS_STYLE} onLoadEnd={onMarkdownLoaded}>
                {I18n.t("rooted.body")}
              </Markdown>
            </Content>
            <FooterWithButtons
              type="TwoButtonsInlineHalf"
              leftButton={leftButton}
              rightButton={rightButton}
            />
          </SafeAreaView>
        </Container>
      </BaseScreenComponent>
    </Modal>
  ));

  return <ComponentWithLoading isLoading={!loaded} loadingOpacity={opacity} />;
};

export default RootedDeviceModal;
