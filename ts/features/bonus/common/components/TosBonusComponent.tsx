import {
  IOButton,
  FooterActions,
  H2,
  IconButton,
  IOColors,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";

import { FunctionComponent, useEffect, useState } from "react";
import {
  BackHandler,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View
} from "react-native";
import WebView from "react-native-webview";
import I18n from "i18next";
import { withLoadingSpinner } from "../../../../components/helpers/withLoadingSpinner";
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
 * @deprecated This component is really old and should be removed/refactored
 */
const TosBonusComponent: FunctionComponent<Props> = props => {
  const handleBackPressed = () => {
    props.onClose();
    return true;
  };
  const [isLoadEnd, setOnLoadEnd] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPressed
    );
    return () => subscription.remove();
  });

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
        <Pictogram name="lostConnection" />
        <VSpacer size={16} />
        <H2>{I18n.t("onboarding.tos.error")}</H2>

        <View style={styles.errorButtonsContainer}>
          <IOButton
            fullWidth
            variant="outline"
            label={I18n.t("global.buttons.retry")}
            onPress={() => {
              setOnLoadEnd(false);
              setHasError(false);
            }}
          />
        </View>
      </View>
    );
  };

  // TODO: Remove HOC to use the theme
  const ContainerComponent = withLoadingSpinner(() => (
    <SafeAreaView style={{ flex: 1, backgroundColor: IOColors.white }}>
      <View
        style={{
          paddingHorizontal: 16,
          alignItems: "flex-end"
        }}
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
        <FooterActions
          actions={{
            type: "SingleButton",
            primary: {
              onPress: props.onClose,
              label: I18n.t("global.buttons.close")
            }
          }}
        />
      )}
    </SafeAreaView>
  ));

  return <ContainerComponent isLoading={!isLoadEnd} />;
};

export default TosBonusComponent;
