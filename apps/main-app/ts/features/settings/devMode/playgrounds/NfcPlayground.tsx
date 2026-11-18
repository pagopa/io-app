import {
  Divider,
  ListItemHeader,
  ListItemInfo,
  VStack
} from "@io-app/design-system";
import {
  getMarketingNames,
  getNfcAntennaPosition,
  type NfcAntennaPositionInfo
} from "@io-app/expo-nfc-antenna-info";
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
        <AntennaPosition />
        <OperationResultScreenContent
          pictogram="accessDenied"
          subtitle="NFC information is not accessible on iOS devices."
          title="Not available on iOS"
        />
      </IOScrollView>
    );
  }

  return (
    <IOScrollView>
      <VStack space={16}>
        <AntennaPosition />
        <DeviceModelInfo />
        <HostCardEmulationInfo />
        <AntennaInfo />
      </VStack>
    </IOScrollView>
  );
};

const AntennaPosition = () => {
  const [result, setResult] = useState<NfcAntennaPositionInfo>();
  const [failure, setFailure] = useState<Error>();

  useOnFirstRender(() => {
    getNfcAntennaPosition().then(setResult).catch(setFailure);
  });

  useDebugInfo({
    nfcAntennaPosition: result,
    nfcAntennaPositionFailure: failure
  });

  return (
    <View>
      <ListItemHeader label="NFC Antenna Position" />
      <ListItemInfo
        endElement={{
          type: "badge",
          componentProps: {
            text: failure?.message ?? result?.position ?? "undefined",
            variant: failure ? "error" : "default"
          }
        }}
        value="Position"
      />
      <Divider />
      <ListItemInfo
        endElement={{
          type: "badge",
          componentProps: {
            text: result?.source ?? "undefined",
            variant: "default"
          }
        }}
        value="Source"
      />
      <Divider />
      <ListItemInfo
        endElement={{
          type: "badge",
          componentProps: {
            text: result?.confidence ?? "undefined",
            variant: "default"
          }
        }}
        value="Confidence"
      />
    </View>
  );
};

const DeviceModelInfo = () => {
  const [names, setNames] = useState<Array<string>>();
  const [failure, setFailure] = useState<Error>();

  useOnFirstRender(() => {
    getMarketingNames().then(setNames).catch(setFailure);
  });

  return (
    <View>
      <ListItemHeader label="Device Model" />
      <ListItemInfo
        label="Build.MODEL"
        value={Platform.OS === "android" ? Platform.constants.Model : "-"}
      />
      <Divider />
      <ListItemInfo
        label="Marketing names"
        value={failure?.message ?? names?.join(" / ") ?? "-"}
      />
    </View>
  );
};

const HostCardEmulationInfo = () => {
  const [hasHce, setHasHce] = useState<boolean>();
  const [failure, setFailure] = useState<Error>();

  useOnFirstRender(() => {
    isHceSupported().then(setHasHce).catch(setFailure);
  });

  useDebugInfo({
    hasHce,
    hasHceFailure: failure
  });

  return (
    <View>
      <ListItemHeader label="Host Card Emulation" />
      <ListItemInfo
        endElement={{
          type: "badge",
          componentProps: {
            text: hasHce ? "\u{1F7E2} YES" : "\u{1F534} NO",
            variant: hasHce ? "success" : "error"
          }
        }}
        value="Supports Host Card Emulation (HCE)"
      />
    </View>
  );
};

const AntennaInfo = () => {
  const [nfcAntennaInfo, setNfcAntennaInfo] = useState<NfcAntennaInfo>();
  const [failure, setFailure] = useState<Error>();

  useOnFirstRender(() => {
    getNfcAntennaInfo().then(setNfcAntennaInfo).catch(setFailure);
  });

  useDebugInfo({
    nfcAntennaInfo,
    nfcAntennaInfoFailure: failure
  });

  if (!nfcAntennaInfo) {
    return null;
  }

  return (
    <>
      <View>
        <ListItemHeader label="Device Info" />
        <ListItemInfo
          endElement={{
            type: "badge",
            componentProps: {
              text: nfcAntennaInfo.deviceWidth.toString(),
              variant: "default"
            }
          }}
          value="Device Width (mm)"
        />
        <Divider />
        <ListItemInfo
          endElement={{
            type: "badge",
            componentProps: {
              text: nfcAntennaInfo.deviceHeight.toString(),
              variant: "default"
            }
          }}
          value="Device Height (mm)"
        />
        <Divider />
        <ListItemInfo
          endElement={{
            type: "badge",
            componentProps: {
              text: nfcAntennaInfo.isDeviceFoldable
                ? "\u{1F7E2} YES"
                : "\u{1F534} NO",
              variant: nfcAntennaInfo.isDeviceFoldable ? "success" : "error"
            }
          }}
          value="Is Device Foldable"
        />
      </View>
      <View>
        <ListItemHeader label="Available NFC Antennas" />
        {nfcAntennaInfo.availableNfcAntennas.map((antenna, index) => (
          <View key={index}>
            <ListItemInfo
              endElement={{
                type: "badge",
                componentProps: {
                  text: `X: ${antenna.locationX}, Y: ${antenna.locationY}`,
                  variant: "default"
                }
              }}
              value={`Antenna ${index + 1} Location (mm)`}
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
