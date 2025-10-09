import {
  IOButton,
  Divider,
  IOColors,
  ListItemInfo,
  Pictogram,
  VStack
} from "@pagopa/io-app-design-system";
import { CieUtils } from "@pagopa/io-react-native-cie";
import { StyleSheet, View } from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import { SETTINGS_ROUTES } from "../../../common/navigation/routes";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";

export function CieIasAndMrtdPlayground() {
  const navigation = useIONavigation();
  const [hasNFC, setHasNFC] = useState<boolean | undefined>();
  const [isNFCEnabled, setIsNFCEnabled] = useState<boolean | undefined>();
  const [isCieAuthenticationSupported, setIsCieAuthenticationSupported] =
    useState<boolean | undefined>();

  useHeaderSecondLevel({
    title: "CIE IAT+MRTD Playground"
  });

  useOnFirstRender(async () => {
    setHasNFC(await CieUtils.hasNfcFeature());
    setIsNFCEnabled(await CieUtils.isNfcEnabled());
    setIsCieAuthenticationSupported(
      await CieUtils.isCieAuthenticationSupported()
    );
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.pictogramContainer}>
        <Pictogram name="cie" size={180} />
      </View>
      <View style={styles.infoContainer}>
        <ListItemInfo
          value="Has NFC"
          endElement={{
            type: "badge",
            componentProps: {
              text: hasNFC ? "\u{1F7E2} OK" : "\u{1F534} KO",
              variant: hasNFC ? "success" : "error"
            }
          }}
        />
        <Divider />
        <ListItemInfo
          value="Is NFC enabled"
          endElement={{
            type: "badge",
            componentProps: {
              text: isNFCEnabled ? "\u{1F7E2} OK" : "\u{1F534} KO",
              variant: isNFCEnabled ? "success" : "error"
            }
          }}
        />
        <Divider />
        <ListItemInfo
          value="CIE authentication supported"
          endElement={{
            type: "badge",
            componentProps: {
              text: isCieAuthenticationSupported
                ? "\u{1F7E2} OK"
                : "\u{1F534} KO",
              variant: isCieAuthenticationSupported ? "success" : "error"
            }
          }}
        />
      </View>
      <VStack space={8}>
        <IOButton
          variant="solid"
          label="Start Internal CIE authentication"
          icon="selfCert"
          disabled={!isCieAuthenticationSupported}
          onPress={() =>
            navigation.navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
              screen: SETTINGS_ROUTES.CIE_IAS_AND_MRTD_PLAYGROUND_INTERNAL_AUTH
            })
          }
        />
        <View style={styles.buttonContainer}>
          <IOButton
            variant="link"
            label="Open NFC Settings"
            icon="coggle"
            onPress={() => CieUtils.openNfcSettings()}
          />
        </View>
      </VStack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 24,
    gap: 24
  },
  pictogramContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  infoContainer: {
    backgroundColor: IOColors["grey-50"],
    paddingHorizontal: 16,
    borderRadius: 8
  },
  buttonContainer: {
    alignSelf: "center",
    paddingVertical: 16
  }
});
