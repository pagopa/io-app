import { Body, IOButton } from "@pagopa/io-app-design-system";
import { ISO18013_5 } from "@pagopa/io-react-native-iso18013";
import { Platform, ScrollView, StyleSheet } from "react-native";
import { QrCodeImage } from "../../../../components/QrCodeImage";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import {
  PROXIMITY_STATUS,
  useItwProximityFlow
} from "../hooks/useItwProximityFlow";
import { MDL_BASE64, MDL_BASE64URL } from "../mocks/proximity";

export const START_FLOW_OPTIONS: ReadonlyArray<{
  label: string;
  engagementModes: ReadonlyArray<ISO18013_5.EngagementMode>;
  retrievalMethods: ReadonlyArray<ISO18013_5.RetrievalMethod>;
  needsNfc?: boolean;
}> = [
  {
    label: "Start QRCODE->BLE",
    engagementModes: ["qrcode"],
    retrievalMethods: ["ble"]
  },
  {
    label: "Start QRCODE->NFC",
    engagementModes: ["qrcode"],
    retrievalMethods: ["nfc"],
    needsNfc: true
  },
  {
    label: "Start NFC->BLE",
    engagementModes: ["nfc"],
    retrievalMethods: ["ble"],
    needsNfc: true
  },
  {
    label: "Start NFC->NFC",
    engagementModes: ["nfc"],
    retrievalMethods: ["nfc"],
    needsNfc: true
  },
  {
    label: "Start QRCODE+NFC->BLE+NFC",
    engagementModes: ["qrcode", "nfc"],
    retrievalMethods: ["ble", "nfc"],
    needsNfc: true
  }
];

export const ERROR_CODES: ReadonlyArray<ISO18013_5.ErrorCode> = [
  ISO18013_5.ErrorCode.CBOR_DECODING,
  ISO18013_5.ErrorCode.SESSION_ENCRYPTION,
  ISO18013_5.ErrorCode.SESSION_TERMINATED
];

export const ItwProximityPlaygroundScreen = () => {
  const {
    status,
    qrCode,
    request,
    nfcSessionSecondsLeft,
    nfcCooldownSecondsLeft,
    isNfcEnabled,
    init,
    startFlow,
    closeFlow,
    sendDocument,
    sendError
  } = useItwProximityFlow();

  const isNfcUnavailable =
    Platform.OS === "ios" && nfcCooldownSecondsLeft !== null;

  useHeaderSecondLevel({
    title: "Proximity Playground"
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {status === PROXIMITY_STATUS.IDLE && (
        <IOButton label="Start Proximity flow" onPress={init} />
      )}
      {status === PROXIMITY_STATUS.READY && (
        <>
          <IOButton
            label={"Start QRCODE->BLE"}
            onPress={() => startFlow(["qrcode"], ["ble"])}
          />
          <IOButton
            label={"Start QRCODE->NFC"}
            onPress={() => startFlow(["qrcode"], ["nfc"])}
            disabled={isNfcUnavailable}
          />
          <IOButton
            label={"Start NFC->BLE"}
            onPress={() => startFlow(["nfc"], ["ble"])}
            disabled={isNfcUnavailable}
          />
          <IOButton
            label={"Start NFC->NFC"}
            onPress={() => startFlow(["nfc"], ["nfc"])}
            disabled={isNfcUnavailable}
          />
          <IOButton
            label={"Start QRCODE+NFC->BLE+NFC"}
            onPress={() => startFlow(["qrcode", "nfc"], ["ble", "nfc"])}
            disabled={isNfcUnavailable}
          />
          {isNfcUnavailable && (
            <Body>NFC unavailable — please wait {nfcCooldownSecondsLeft}s</Body>
          )}
        </>
      )}
      {status === PROXIMITY_STATUS.ENGAGEMENT && qrCode && (
        <QrCodeImage value={qrCode} size={200} />
      )}
      {status === PROXIMITY_STATUS.ENGAGEMENT && isNfcEnabled && (
        <>
          <Body>
            NFC engagement active, tap the back of both devices toward each
            other and hold them together
          </Body>
          {Platform.OS === "ios" &&
            nfcSessionSecondsLeft !== null &&
            nfcSessionSecondsLeft > 0 && (
              <Body>Session expires in {nfcSessionSecondsLeft}s</Body>
            )}
        </>
      )}
      {status === PROXIMITY_STATUS.PRESENTING && request && (
        <>
          <IOButton
            label="Send document (base64)"
            onPress={() => sendDocument(request, MDL_BASE64)}
          />
          <IOButton
            label="Send document (base64url)"
            onPress={() => sendDocument(request, MDL_BASE64URL)}
          />
          <IOButton
            label="Send broken document"
            onPress={() => sendDocument(request, MDL_BASE64.slice(0, -10))}
          />
          <IOButton
            label={`Send error ${ISO18013_5.ErrorCode.CBOR_DECODING} (${ISO18013_5.ErrorCode[ISO18013_5.ErrorCode.CBOR_DECODING]})`}
            onPress={() => sendError(ISO18013_5.ErrorCode.CBOR_DECODING)}
          />
          <IOButton
            label={`Send error ${ISO18013_5.ErrorCode.SESSION_ENCRYPTION} (${ISO18013_5.ErrorCode[ISO18013_5.ErrorCode.SESSION_ENCRYPTION]})`}
            onPress={() => sendError(ISO18013_5.ErrorCode.SESSION_ENCRYPTION)}
          />
          <IOButton
            label={`Send error ${ISO18013_5.ErrorCode.SESSION_TERMINATED} (${ISO18013_5.ErrorCode[ISO18013_5.ErrorCode.SESSION_TERMINATED]})`}
            onPress={() => sendError(ISO18013_5.ErrorCode.SESSION_TERMINATED)}
          />
        </>
      )}

      {(status === PROXIMITY_STATUS.ENGAGEMENT ||
        status === PROXIMITY_STATUS.PRESENTING ||
        status === PROXIMITY_STATUS.ERROR) && (
        <IOButton
          label={"Close Engagement"}
          onPress={() => closeFlow(status === PROXIMITY_STATUS.PRESENTING)}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24
  }
});
