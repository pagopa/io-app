import {
  Divider,
  ListItemHeader,
  ListItemInfo,
  VStack
} from "@pagopa/io-app-design-system";
import { constNull } from "fp-ts/lib/function";
import { useState } from "react";
import { Platform, View } from "react-native";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { IOScrollView } from "../../../../components/ui/IOScrollView";
import { useDebugInfo } from "../../../../hooks/useDebugInfo";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import {
  getNfcAntennaInfo,
  isHceSupported,
  NfcAntennaInfo
} from "../../../../utils/nfc";

export const NfcPlayground = () => {
  useHeaderSecondLevel({
    title: "NFC Playgrounds"
  });

  if (Platform.OS === "ios") {
    return (
      <IOScrollView centerContent={true}>
        <OperationResultScreenContent
          pictogram="accessDenied"
          title="Not available on iOS"
          subtitle="NFC information is not accessible on iOS devices."
        />
      </IOScrollView>
    );
  }

  return (
    <IOScrollView>
      <VStack space={16}>
        <HostCardEmulationInfo />
        <AntennaInfo />
      </VStack>
    </IOScrollView>
  );
};

const HostCardEmulationInfo = () => {
  const [hasHce, setHasHce] = useState<boolean>();

  useOnFirstRender(async () => {
    isHceSupported().then(setHasHce).catch(constNull);
  });

  useDebugInfo({
    hasHce
  });

  return (
    <View>
      <ListItemHeader label="Host Card Emulation" />
      <ListItemInfo
        value="Supports Host Card Emulation (HCE)"
        endElement={{
          type: "badge",
          componentProps: {
            text: hasHce ? "\u{1F7E2} YES" : "\u{1F534} NO",
            variant: hasHce ? "success" : "error"
          }
        }}
      />
    </View>
  );
};

const AntennaInfo = () => {
  const [nfcAntennaInfo, setNfcAntennaInfo] = useState<NfcAntennaInfo>();

  useOnFirstRender(async () => {
    getNfcAntennaInfo().then(setNfcAntennaInfo).catch(constNull);
  });

  useDebugInfo({
    nfcAntennaInfo
  });

  if (!nfcAntennaInfo) {
    return null;
  }

  return (
    <>
      <View>
        <ListItemHeader label="Device Info" />
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
      </View>
      <View>
        <ListItemHeader label="Available NFC Antennas" />
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
    </>
  );
};
