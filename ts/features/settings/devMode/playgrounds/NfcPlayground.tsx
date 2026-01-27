import {
  Body,
  Divider,
  IOText,
  ListItemInfo,
  Pictogram
} from "@pagopa/io-app-design-system";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoadingScreenContent } from "../../../../components/screens/LoadingScreenContent";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useDebugInfo } from "../../../../hooks/useDebugInfo";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { getNfcAntennaInfo, NfcAntennaInfo } from "../../../../utils/nfc";

export const NfcPlayground = () => {
  const [failure, setFailure] = useState<Error>();
  const [nfcAntennaInfo, setNfcAntennaInfo] = useState<NfcAntennaInfo>();

  useHeaderSecondLevel({
    title: "NFC Playground"
  });

  useOnFirstRender(async () => {
    try {
      const info = await getNfcAntennaInfo();
      setNfcAntennaInfo(info);
    } catch (e) {
      setFailure(e instanceof Error ? e : new Error(String(e)));
    }
  });

  useDebugInfo({
    nfcAntennaInfo,
    failure
  });

  if (failure !== undefined) {
    return (
      <OperationResultScreenContent
        isHeaderVisible={true}
        pictogram="attention"
        title="NFC Antenna Info not available on this device."
      >
        <IOText
          font="FiraCode"
          size={12}
          lineHeight={18}
          color={"grey-700"}
          weight="Medium"
        >
          {JSON.stringify(failure, null, 2)}
        </IOText>
      </OperationResultScreenContent>
    );
  }

  if (!nfcAntennaInfo) {
    return <LoadingScreenContent title="Getting NFC info" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.pictogramContainer}>
        <Pictogram name="nfcScanAndroid" size={180} />
      </View>
      <View style={styles.infoContainer}>
        <ListItemInfo
          value="Device Width (mm)"
          endElement={{
            type: "badge",
            componentProps: {
              text: nfcAntennaInfo.deviceWidth.toString(),
              variant: "default"
            }
          }}
        />
        <Divider />
        <ListItemInfo
          value="Device Height (mm)"
          endElement={{
            type: "badge",
            componentProps: {
              text: nfcAntennaInfo.deviceHeight.toString(),
              variant: "default"
            }
          }}
        />
        <Divider />
        <ListItemInfo
          value="Is Device Foldable"
          endElement={{
            type: "badge",
            componentProps: {
              text: nfcAntennaInfo.isDeviceFoldable
                ? "\u{1F7E2} YES"
                : "\u{1F534} NO",
              variant: nfcAntennaInfo.isDeviceFoldable ? "success" : "error"
            }
          }}
        />
        <Divider />
        <Body style={styles.antennaHeader}>Available NFC Antennas:</Body>
        {nfcAntennaInfo.availableNfcAntennas.map((antenna, index) => (
          <View key={index}>
            <ListItemInfo
              value={`Antenna ${index + 1} Location (mm)`}
              endElement={{
                type: "badge",
                componentProps: {
                  text: `X: ${antenna.locationX}, Y: ${antenna.locationY}`,
                  variant: "default"
                }
              }}
            />
            {index < nfcAntennaInfo.availableNfcAntennas.length - 1 && (
              <Divider />
            )}
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  pictogramContainer: {
    alignItems: "center",
    marginBottom: 24
  },
  infoContainer: {
    flex: 1
  },
  antennaHeader: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: "bold"
  }
});
