import {
  Body,
  Container,
  Content,
  Right,
  Text as NBButtonText,
  View
} from "native-base";
import * as React from "react";
import { BackHandler, Image, SafeAreaView, StyleSheet } from "react-native";
import WebView from "react-native-webview";
import brokenLinkImage from "../../../../../img/broken-link.png";
import ButtonDefaultOpacity from "../../../../components/ButtonDefaultOpacity";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import { H2 } from "../../../../components/core/typography/H2";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { withLoadingSpinner } from "../../../../components/helpers/withLoadingSpinner";
import AppHeader from "../../../../components/ui/AppHeader";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import I18n from "../../../../i18n";
import { AVOID_ZOOM_JS, closeInjectedScript } from "../../../../utils/webview";
import { Icon } from "../../../../components/core/icons/Icon";

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
        <VSpacer size={16} />
        <H2 weight="Bold">{I18n.t("onboarding.tos.error")}</H2>

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
            <NBButtonText>{I18n.t("global.buttons.retry")}</NBButtonText>
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
            <Icon name="closeLarge" />
          </ButtonDefaultOpacity>
        </Right>
      </AppHeader>
      <SafeAreaView style={IOStyles.flex}>
        <Content contentContainerStyle={styles.flex1} noPadded={true}>
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
        </Content>
        {isLoadEnd && (
          <FooterWithButtons
            type="SingleButton"
            leftButton={closeButtonProps}
          />
        )}
      </SafeAreaView>
    </Container>
  ));
  return <ContainerComponent isLoading={!isLoadEnd} />;
};

export default TosBonusComponent;
