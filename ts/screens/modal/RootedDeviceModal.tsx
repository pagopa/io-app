import { Container, Content } from "native-base";
import * as React from "react";
import {
  View,
  Alert,
  AlertButton,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet
} from "react-native";
import image from "../../../img/rooted/broken-phone.png";
import { VSpacer } from "../../components/core/spacer/Spacer";
import { H2 } from "../../components/core/typography/H2";
import { IOStyles } from "../../components/core/variables/IOStyles";
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

const opacity = 0.9;

type ConfirmConfig = {
  title: string;
  body?: string;
  confirmText: string;
  cancelText?: string;
  onConfirmAction: () => void;
};

const RootedDeviceModal: React.FunctionComponent<Props> = (props: Props) => {
  const [markdownLoaded, setMarkdownLoaded] = React.useState(false);

  const showAlert = (confirmConfig: ConfirmConfig) => {
    const buttons: ReadonlyArray<AlertButton> = [
      {
        text: confirmConfig.cancelText
      },
      {
        text: confirmConfig.confirmText,
        onPress: confirmConfig.onConfirmAction,
        style: "cancel"
      }
    ];
    Alert.alert(
      confirmConfig.title,
      confirmConfig.body ? confirmConfig.body : "",
      buttons.slice(confirmConfig.cancelText ? 0 : 1), // remove cancel button if cancelText is undefined
      { cancelable: true }
    );
  };

  const continueAlertConfig: ConfirmConfig = {
    title: I18n.t("rooted.continueAlert.title"),
    body: I18n.t("rooted.continueAlert.body"),
    confirmText: I18n.t("rooted.continueAlert.confirmText"),
    cancelText: I18n.t("rooted.continueAlert.cancelText"),
    onConfirmAction: props.onContinue
  };

  const cancelAlertConfig: ConfirmConfig = {
    title: I18n.t("rooted.cancelAlert.title"),
    body: I18n.t("rooted.cancelAlert.body"),
    confirmText: I18n.t("rooted.cancelAlert.confirmText"),
    onConfirmAction: props.onCancel
  };

  const leftButton: BlockButtonProps = {
    title: I18n.t("global.buttons.continue"),
    bordered: true,
    danger: true,
    onPress: () => showAlert(continueAlertConfig)
  };

  const rightButton: BlockButtonProps = {
    title: I18n.t("global.buttons.cancel"),
    primary: true,
    onPress: () => showAlert(cancelAlertConfig)
  };

  const onMarkdownLoaded = () => {
    setMarkdownLoaded(true);
  };

  const body = Platform.select({
    ios: I18n.t("rooted.bodyiOS"),
    default: I18n.t("rooted.bodyAndroid")
  });
  const ComponentWithLoading = withLoadingSpinner(() => (
    <BaseScreenComponent
      goBack={false}
      accessibilityEvents={{ avoidNavigationEventsUsage: true }}
    >
      <Container>
        <SafeAreaView style={styles.flex}>
          <Content>
            <View style={styles.main}>
              <Image source={image} resizeMode="contain" style={styles.image} />
              <VSpacer size={24} />
              <View style={IOStyles.alignCenter}>
                <H2>{I18n.t("rooted.title")}</H2>
              </View>
            </View>
            <VSpacer size={8} />
            <Markdown
              cssStyle={CSS_STYLE}
              onLoadEnd={onMarkdownLoaded}
              extraBodyHeight={100}
            >
              {body}
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
  ));

  return (
    <ComponentWithLoading
      isLoading={!markdownLoaded}
      loadingOpacity={opacity}
    />
  );
};

export default RootedDeviceModal;
