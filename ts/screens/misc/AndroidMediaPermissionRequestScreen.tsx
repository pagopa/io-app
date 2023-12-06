import {
  Body,
  Divider,
  GradientScrollView,
  H2,
  ListItemHeader,
  ListItemInfo,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { Linking } from "react-native";
import { useHeaderSecondLevel } from "../../hooks/useHeaderSecondLevel";

const AndroidMediaPermissionRequestScreen = () => {
  useHeaderSecondLevel({ title: "" });

  const handleOpenAppSettings = async () => {
    await Linking.openSettings();
  };

  return (
    <GradientScrollView
      primaryActionProps={{
        label: "Apri Impostazioni",
        accessibilityLabel: "Apri Impostazioni",
        onPress: handleOpenAppSettings
      }}
    >
      <>
        <H2>Consenti a IO di accedere alle tue foto</H2>
        <VSpacer size={8} />
        <Body>
          Per farlo, devi modificare le preferenze nelle impostazioni di sistema
          del tuo dispositivo.
        </Body>
        <VSpacer size={8} />
        <ListItemHeader label="Ecco come:" />
        <ListItemInfo
          label="Step 1"
          value="Vai su “Impostazioni”"
          icon="systemSettingsAndroid"
        />
        <Divider />
        <ListItemInfo
          label="Step 2"
          value="Seleziona “Applicazioni”"
          icon="systemAppsAndroid"
        />
        <Divider />
        <ListItemInfo
          label="Step 3"
          value="Seleziona “IO”"
          icon="productIOAppBlueBg"
        />
        <Divider />
        <ListItemInfo
          label="Step 4"
          value="Seleziona la voce relativa alle autorizzazioni"
          icon="systemSettingsAndroid"
        />
        <Divider />
        <ListItemInfo
          label="Step 5"
          value="Consenti l’accesso a file e media"
          icon="systemToggleInstructions"
        />
      </>
    </GradientScrollView>
  );
};

export { AndroidMediaPermissionRequestScreen };
