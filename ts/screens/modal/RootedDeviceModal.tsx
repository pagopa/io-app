import {
  BlockButtonProps,
  FooterWithButtons,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as React from "react";
import {
  Alert,
  AlertButton,
  GestureResponderEvent,
  Image,
  Platform,
  StyleSheet,
  View
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import image from "../../../img/rooted/broken-phone.png";
import { H2 } from "../../components/core/typography/H2";
import { IOStyles } from "../../components/core/variables/IOStyles";
import { withLoadingSpinner } from "../../components/helpers/withLoadingSpinner";
import LegacyMarkdown from "../../components/ui/Markdown/LegacyMarkdown";
import { useHeaderSecondLevel } from "../../hooks/useHeaderSecondLevel";
import I18n from "../../i18n";
import customVariables from "../../theme/variables";
import { trackLoginRootedScreen } from "./analytics";

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

const RootedDeviceModal = (props: Props) => {
  const [markdownLoaded, setMarkdownLoaded] = React.useState(false);
  trackLoginRootedScreen();

  useHeaderSecondLevel({
    title: "",
    canGoBack: false
  });

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
    type: "Outline",
    buttonProps: {
      color: "danger",
      label: I18n.t("global.buttons.continue"),
      accessibilityLabel: I18n.t("global.buttons.continue"),
      onPress: (_: GestureResponderEvent) => showAlert(continueAlertConfig)
    }
  };

  const rightButton: BlockButtonProps = {
    type: "Solid",
    buttonProps: {
      color: "primary",
      label: I18n.t("global.buttons.cancel"),
      accessibilityLabel: I18n.t("global.buttons.cancel"),
      onPress: (_: GestureResponderEvent) => showAlert(cancelAlertConfig)
    }
  };

  const onMarkdownLoaded = () => {
    setMarkdownLoaded(true);
  };

  const body = Platform.select({
    ios: I18n.t("rooted.bodyiOS"),
    default: I18n.t("rooted.bodyAndroid")
  });
  const ComponentWithLoading = withLoadingSpinner(() => (
    <SafeAreaView edges={["bottom"]} style={styles.flex}>
      <ScrollView style={IOStyles.horizontalContentPadding}>
        <View style={styles.main}>
          <Image
            accessibilityIgnoresInvertColors
            source={image}
            resizeMode="contain"
            style={styles.image}
          />
          <VSpacer size={24} />
          <View style={IOStyles.alignCenter}>
            <H2>{I18n.t("rooted.title")}</H2>
          </View>
        </View>
        <VSpacer size={8} />
        <LegacyMarkdown
          cssStyle={CSS_STYLE}
          onLoadEnd={onMarkdownLoaded}
          extraBodyHeight={100}
        >
          {body}
        </LegacyMarkdown>
      </ScrollView>
      <FooterWithButtons
        type="TwoButtonsInlineHalf"
        primary={leftButton}
        secondary={rightButton}
      />
    </SafeAreaView>
  ));

  return (
    <ComponentWithLoading
      isLoading={!markdownLoaded}
      loadingOpacity={opacity}
    />
  );
};

export default RootedDeviceModal;
