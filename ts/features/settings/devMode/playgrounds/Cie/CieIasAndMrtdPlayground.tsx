import {
  IOButton,
  Divider,
  IOColors,
  ListItemInfo,
  Pictogram,
  VStack
} from "@pagopa/io-app-design-system";
import { CieUtils } from "@pagopa/io-react-native-cie";
import { useNavigation } from "@react-navigation/native";
import { StyleSheet, View } from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";

export function CieIasAndMrtdPlayground() {
  const navigation = useNavigation();
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
              text: hasNFC ? "🟢 OK" : "🔴 KO",
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
              text: isNFCEnabled ? "🟢 OK" : "🔴 KO",
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
              text: isCieAuthenticationSupported ? "🟢 OK" : "🔴 KO",
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
          onPress={() => void 0}
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
