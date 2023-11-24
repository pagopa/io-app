import * as React from "react";
import {
  BackHandler,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View
} from "react-native";
import WebView from "react-native-webview";
import {
  ButtonOutline,
  ButtonSolidProps,
  FooterWithButtons,
  H2,
  IconButton,
  VSpacer
} from "@pagopa/io-app-design-system";
import brokenLinkImage from "../../../../../img/broken-link.png";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { withLoadingSpinner } from "../../../../components/helpers/withLoadingSpinner";
import I18n from "../../../../i18n";
import { AVOID_ZOOM_JS, closeInjectedScript } from "../../../../utils/webview";

type Props = {
  onClose: () => void;
  tos_url: string;
};

const styles = StyleSheet.create({
  flex1: {
    flex: 1
  },
  flex2: {
    flex: 2
  },
  errorContainer: {
    padding: 20,
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  errorButtonsContainer: {
    position: "absolute",
    bottom: 30,
    flex: 1,
    flexDirection: "row"
  }
});

/**
 * Component to show the TOS for the bonus activation flow
 */
const TosBonusComponent: React.FunctionComponent<Props> = props => {
  const handleBackPressed = () => {
    props.onClose();
    return true;
  };
  const [isLoadEnd, setOnLoadEnd] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  React.useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPressed
    );
    return () => subscription.remove();
  });

  const closeButtonProps: ButtonSolidProps = {
    onPress: props.onClose,
    label: I18n.t("global.buttons.close"),
    accessibilityLabel: I18n.t("global.buttons.close")
  };

  const handleLoadEnd = () => setOnLoadEnd(true);

  const handleError = () => {
    setHasError(true);
  };

  const renderError = () => {
    if (hasError === false) {
      return null;
    }
    return (
      <View style={styles.errorContainer}>
        <Image source={brokenLinkImage} resizeMode="contain" />
        <VSpacer size={16} />
        <H2>{I18n.t("onboarding.tos.error")}</H2>

        <View style={styles.errorButtonsContainer}>
          <ButtonOutline
            label={I18n.t("global.buttons.retry")}
            accessibilityLabel={I18n.t("global.buttons.retry")}
            onPress={() => {
              setOnLoadEnd(false);
              setHasError(false);
            }}
            fullWidth
          />
        </View>
      </View>
    );
  };
  const ContainerComponent = withLoadingSpinner(() => (
    <SafeAreaView style={[IOStyles.flex, IOStyles.bgWhite]}>
      <View
        style={[IOStyles.horizontalContentPadding, { alignItems: "flex-end" }]}
      >
        <IconButton
          color="neutral"
          accessibilityLabel={I18n.t("global.buttons.close")}
          icon="closeLarge"
          onPress={props.onClose}
        />
      </View>
      <ScrollView contentContainerStyle={styles.flex1}>
        {renderError()}
        {!hasError && (
          <View style={styles.flex1}>
            <WebView
              androidCameraAccessDisabled={true}
              androidMicrophoneAccessDisabled={true}
              textZoom={100}
              style={styles.flex2}
              onLoadEnd={handleLoadEnd}
              onError={handleError}
              source={{ uri: props.tos_url }}
              injectedJavaScript={closeInjectedScript(AVOID_ZOOM_JS)}
            />
          </View>
        )}
      </ScrollView>
      {isLoadEnd && (
        <View>
          <FooterWithButtons
            type="SingleButton"
            primary={{ type: "Outline", buttonProps: closeButtonProps }}
          />
        </View>
      )}
    </SafeAreaView>
  ));
  return <ContainerComponent isLoading={!isLoadEnd} />;
};

export default TosBonusComponent;
