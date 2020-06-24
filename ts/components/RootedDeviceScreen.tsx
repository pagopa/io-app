import { Container, Text, View } from "native-base";
import * as React from "react";
import { Image, SafeAreaView, StyleSheet } from "react-native";
import I18n from "../i18n";
import customVariables from "../theme/variables";
import { withLoadingSpinner } from "./helpers/withLoadingSpinner";
import AppHeader from "./ui/AppHeader";
import { BlockButtonProps } from "./ui/BlockButtons";
import FooterWithButtons from "./ui/FooterWithButtons";
import Markdown from "./ui/Markdown";

type Props = {
  onContinue: () => void;
  onCancel: () => void;
};

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  main: {
    padding: customVariables.contentPadding,
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

const image = require("../../img/rooted/broken-phone.png");

const opacity = 0.9;
const markdownComponents = 1;

const RootedDeviceScreen: React.FunctionComponent<Props> = (props: Props) => {
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
    <Container>
      <AppHeader noLeft={true} />
      <View spacer={true} large={true} />
      <SafeAreaView style={styles.flex}>
        <View style={styles.main}>
          <Image source={image} resizeMode="contain" style={styles.image} />
          <View spacer={true} large={true} />
          <Text style={styles.title} bold={true} dark={true}>
            {I18n.t("rooted.title")}
          </Text>
          <Markdown onLoadEnd={onMarkdownLoaded}>
            {I18n.t("rooted.body")}
          </Markdown>
        </View>
        <FooterWithButtons
          type="TwoButtonsInlineHalf"
          leftButton={leftButton}
          rightButton={rightButton}
        />
      </SafeAreaView>
    </Container>
  ));

  return <ComponentWithLoading isLoading={!loaded} loadingOpacity={opacity} />;
};

export default RootedDeviceScreen;
