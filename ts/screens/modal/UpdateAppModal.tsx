/**
 * A screen to invite the user to update the app because current version is not supported yet
 *
 */

import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { Button, Container, Text as NBButtonText } from "native-base";
import React, { FC, useCallback, useEffect, useState } from "react";
import {
  View,
  BackHandler,
  Image,
  Linking,
  Modal,
  Platform,
  StyleSheet
} from "react-native";
import updateIcon from "../../../img/icons/update-icon.png";
import { VSpacer } from "../../components/core/spacer/Spacer";
import { Body } from "../../components/core/typography/Body";
import { H1 } from "../../components/core/typography/H1";
import { Label } from "../../components/core/typography/Label";
import { IOStyles } from "../../components/core/variables/IOStyles";

import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import SectionStatusComponent from "../../components/SectionStatus";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import { useHardwareBackButton } from "../../hooks/useHardwareBackButton";
import I18n from "../../i18n";
import customVariables from "../../theme/variables";
import { storeUrl, webStoreURL } from "../../utils/appVersion";
import { emptyContextualHelp } from "../../utils/emptyContextualHelp";
import { openWebUrl } from "../../utils/url";

const ERROR_MESSAGE_TIMEOUT: Millisecond = 5000 as Millisecond;

const styles = StyleSheet.create({
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

const IOSFooter: FC<FooterProps> = ({ onOpenAppStore }: FooterProps) => (
  <View style={IOStyles.footer}>
    <>
      <Button
        block={true}
        primary={true}
        onPress={onOpenAppStore}
        accessibilityRole={"button"}
      >
        <NBButtonText>{I18n.t("btnUpdateApp")}</NBButtonText>
      </Button>
      <VSpacer size={16} />
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
  useHardwareBackButton(() => true);

  // Reset the error state after a given timeout
  const [error, setError] = useState(false);

  useEffect(() => {
    if (error) {
      const timeoutHandle = setTimeout(
        () => setError(false),
        ERROR_MESSAGE_TIMEOUT
      );

      return () => clearTimeout(timeoutHandle);
    }

    return undefined;
  }, [error]);

  // Tries to open the native app store, falling to browser web store
  const openAppStore = useCallback(async () => {
    try {
      await Linking.openURL(storeUrl);
    } catch (e) {
      openWebUrl(webStoreURL, () => setError(true));
    }
  }, []);

  return (
    <Modal>
      <BaseScreenComponent
        appLogo={true}
        goBack={false}
        accessibilityEvents={{ avoidNavigationEventsUsage: true }}
        contextualHelp={emptyContextualHelp}
      >
        <Container>
          <View style={styles.container}>
            <H1>{I18n.t("titleUpdateApp")}</H1>
            <VSpacer size={24} />
            <Body>{I18n.t("messageUpdateApp")}</Body>
            <Image style={styles.img} source={updateIcon} />
            {error && (
              <View style={IOStyles.alignCenter}>
                <VSpacer size={24} />
                <Label color="red" weight="SemiBold">
                  {I18n.t("msgErrorUpdateApp")}
                </Label>
              </View>
            )}
          </View>
        </Container>
        <SectionStatusComponent sectionKey={"app_update_required"} />
      </BaseScreenComponent>
      {Platform.select({
        default: <AndroidFooter onOpenAppStore={openAppStore} />,
        ios: <IOSFooter onOpenAppStore={openAppStore} />
      })}
    </Modal>
  );
};

export default UpdateAppModal;
