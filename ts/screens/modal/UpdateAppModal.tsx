/**
 * A screen to invite the user to update the app because current version is not supported yet
 *
 */

import React, { FC, useCallback, useEffect, useState } from "react";

import { Millisecond } from "italia-ts-commons/lib/units";
import { Button, Container, H2, Text, View } from "native-base";
import {
  BackHandler,
  Image,
  Linking,
  Modal,
  Platform,
  StyleSheet
} from "react-native";

import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import I18n from "../../i18n";
import customVariables from "../../theme/variables";
import { storeUrl, webStoreURL } from "../../utils/appVersion";

const ERROR_MESSAGE_TIMEOUT: Millisecond = 5000 as Millisecond;

const styles = StyleSheet.create({
  text: {
    marginTop: customVariables.contentPadding,
    fontSize: 18
  },
  textDanger: {
    marginTop: customVariables.contentPadding,
    fontSize: 18,
    textAlign: "center",
    color: customVariables.brandDanger
  },
  container: {
    margin: customVariables.contentPadding,
    flex: 1,
    alignItems: "flex-start"
  },
  img: {
    marginTop: customVariables.contentPaddingLarge,
    alignSelf: "center"
  }
});

type FooterProps = { onOpenAppStore: () => void };

const AppleFooter: FC<FooterProps> = ({ onOpenAppStore }: FooterProps) => (
  <View footer>
    <>
      <Button block={true} primary={true} onPress={onOpenAppStore}>
        <Text>{I18n.t("btnUpdateApp")}</Text>
      </Button>
      <View spacer />
    </>
  </View>
);

const AndroidFooter: FC<FooterProps> = ({ onOpenAppStore }: FooterProps) => {
  const cancelButtonProps = {
    cancel: true,
    block: true,
    onPress: () => BackHandler.exitApp(),
    title: I18n.t("global.buttons.close")
  };

  const updateButtonProps = {
    block: true,
    primary: true,
    onPress: onOpenAppStore,
    title: I18n.t("btnUpdateApp")
  };

  return (
    <FooterWithButtons
      type="TwoButtonsInlineThird"
      leftButton={cancelButtonProps}
      rightButton={updateButtonProps}
    />
  );
};

const UpdateAppModal: React.FC = () => {
  // Disable Android back button
  const handleBackPress = () => true;

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", handleBackPress);

    return () =>
      BackHandler.removeEventListener("hardwareBackPress", handleBackPress);
  }, []);

  // Reset the error state after a given timeout
  const [error, setError] = useState(false);

  useEffect(() => {
    if (error) {
      setTimeout(() => setError(false), ERROR_MESSAGE_TIMEOUT);
    }
  }, [error]);

  // Tries to open the native app store, falling to browser web store
  const openAppStore = useCallback(async () => {
    try {
      await Linking.openURL(storeUrl);
    } catch (e) {
      try {
        await Linking.openURL(webStoreURL);
      } catch (e) {
        setError(true);
      }
    }
  }, [setError]);

  return (
    <Modal>
      <BaseScreenComponent
        appLogo={true}
        goBack={false}
        accessibilityEvents={{ avoidNavigationEventsUsage: true }}
      >
        <Container>
          <View style={styles.container}>
            <H2>{I18n.t("titleUpdateApp")}</H2>
            <Text style={styles.text}>{I18n.t("messageUpdateApp")}</Text>
            <Image
              style={styles.img}
              source={require("../../../img/icons/update-icon.png")}
            />
            {error && (
              <Text style={styles.textDanger}>
                {I18n.t("msgErrorUpdateApp")}
              </Text>
            )}
          </View>
        </Container>
      </BaseScreenComponent>
      {Platform.select({
        ios: <AppleFooter onOpenAppStore={openAppStore} />,
        android: <AndroidFooter onOpenAppStore={openAppStore} />
      })}
    </Modal>
  );
};

export default UpdateAppModal;
