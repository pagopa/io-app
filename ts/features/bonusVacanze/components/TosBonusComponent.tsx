import { Body, Container, Content, Right, Text, View } from "native-base";
import * as React from "react";
import { BackHandler, Image, StyleSheet } from "react-native";
import WebView from "react-native-webview";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import { withLoadingSpinner } from "../../../components/helpers/withLoadingSpinner";
import AppHeader from "../../../components/ui/AppHeader";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import IconFont from "../../../components/ui/IconFont";
import I18n from "../../../i18n";
import { AVOID_ZOOM_JS } from "../../../screens/onboarding/TosScreen";

type Props = {
  onClose: () => void;
  tos_url: string;
};

const styles = StyleSheet.create({
  contentContainerStyle: {
    flex: 1
  },
  webViewContainer: {
    flex: 1
  },
  errorContainer: {
    padding: 20,
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  errorTitle: {
    fontSize: 20,
    marginTop: 10
  },

  errorBody: {
    marginTop: 10,
    marginBottom: 10,
    textAlign: "center"
  },

  errorButtonsContainer: {
    position: "absolute",
    bottom: 30,
    flex: 1,
    flexDirection: "row"
  },
  cancelButtonStyle: {
    flex: 1,
    marginEnd: 10
  }
});

const brokenLinkImage = require("../../../../img/broken-link.png");

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
    BackHandler.addEventListener("hardwareBackPress", handleBackPressed);

    return () =>
      BackHandler.removeEventListener("hardwareBackPress", handleBackPressed);
  });

  const closeButtonProps = {
    block: true,
    primary: true,
    onPress: props.onClose,
    title: I18n.t("global.buttons.close")
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
        <Text style={styles.errorTitle} bold={true}>
          {I18n.t("onboarding.tos.error")}
        </Text>

        <View style={styles.errorButtonsContainer}>
          <ButtonDefaultOpacity
            onPress={() => {
              setOnLoadEnd(false);
              setHasError(false);
            }}
            style={{ flex: 2 }}
            block={true}
            primary={true}
          >
            <Text>{I18n.t("global.buttons.retry")}</Text>
          </ButtonDefaultOpacity>
        </View>
      </View>
    );
  };
  const ContainerComponent = withLoadingSpinner(() => (
    <Container>
      <AppHeader noLeft={true}>
        <Body />
        <Right>
          <ButtonDefaultOpacity onPress={props.onClose} transparent={true}>
            <IconFont name="io-close" />
          </ButtonDefaultOpacity>
        </Right>
      </AppHeader>
      <Content
        contentContainerStyle={styles.contentContainerStyle}
        noPadded={true}
      >
        {renderError()}
        {!hasError && (
          <View style={styles.webViewContainer}>
            <WebView
              textZoom={100}
              style={{ flex: 1 }}
              onLoadEnd={handleLoadEnd}
              onError={handleError}
              source={{ uri: props.tos_url }}
              injectedJavaScript={AVOID_ZOOM_JS}
            />
          </View>
        )}
      </Content>
      {isLoadEnd && (
        <FooterWithButtons type="SingleButton" leftButton={closeButtonProps} />
      )}
    </Container>
  ));
  return <ContainerComponent isLoading={!isLoadEnd} />;
};

export default TosBonusComponent;
