import {
  Body,
  IOButton,
  ListItemSwitch,
  VStack
} from "@pagopa/io-app-design-system";
import { ISO18013_5 } from "@pagopa/io-react-native-iso18013";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { QrCodeImage } from "../../../../components/QrCodeImage";
import { IOScrollView } from "../../../../components/ui/IOScrollView";
import { useDebugInfo } from "../../../../hooks/useDebugInfo";
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
}> = [
  {
    label: "Start QRCODE->BLE",
    engagementModes: ["qrcode"],
    retrievalMethods: ["ble"]
  },
  {
    label: "Start QRCODE->NFC",
    engagementModes: ["qrcode"],
    retrievalMethods: ["nfc"]
  },
  {
    label: "Start NFC->BLE",
    engagementModes: ["nfc"],
    retrievalMethods: ["ble"]
  },
  {
    label: "Start NFC->NFC",
    engagementModes: ["nfc"],
    retrievalMethods: ["nfc"]
  },
  {
    label: "Start QRCODE+NFC->BLE+NFC",
    engagementModes: ["qrcode", "nfc"],
    retrievalMethods: ["ble", "nfc"]
  }
];

export const ERROR_CODES: ReadonlyArray<ISO18013_5.ErrorCode> = [
  ISO18013_5.ErrorCode.CBOR_DECODING,
  ISO18013_5.ErrorCode.SESSION_ENCRYPTION,
  ISO18013_5.ErrorCode.SESSION_TERMINATED
];

export const ItwProximityPlaygroundScreen = () => {
  const [skipConsent, setSkipConsent] = useState(true);

  const {
    status,
    qrCode,
    request,
    isNfcEnabled,
    startFlow,
    closeFlow,
    sendDocument,
    sendError
  } = useItwProximityFlow();

  useDebugInfo({
    status,
    request,
    isNfcEnabled
  });

  useHeaderSecondLevel({
    title: "Proximity Playground"
  });

  useEffect(() => {
    if (!request) {
      return;
    }

    if (skipConsent && request) {
      // If NFC retrieval mode we send documents immediately after receiving the request, without waiting for user interaction
      void sendDocument(request, MDL_BASE64);
      return;
    }
  }, [skipConsent, request, sendDocument]);

  return (
    <LoadingSpinnerOverlay
      isLoading={status === PROXIMITY_STATUS.IDLE}
      loadingOpacity={1}
    >
      <IOScrollView
        contentContainerStyle={styles.container}
        centerContent={true}
      >
        {/* Top section */}

        <View style={{ flex: 1, alignItems: "center" }}>
          {status === PROXIMITY_STATUS.ENGAGEMENT && qrCode && (
            <QrCodeImage value={qrCode} size={"80%"} />
          )}
          {status === PROXIMITY_STATUS.ENGAGEMENT && isNfcEnabled && (
            <>
              <Body>
                NFC engagement active, tap the back of both devices toward each
                other and hold them together
              </Body>
            </>
          )}
        </View>

        {/* Buttons */}

        <VStack space={8}>
          {status === PROXIMITY_STATUS.READY && (
            <>
              <ListItemSwitch
                label="Skip consent"
                description="Documents will be shared as soon as a valid request is received"
                value={skipConsent}
                onSwitchValueChange={() => setSkipConsent(v => !v)}
              />
              {START_FLOW_OPTIONS.map(
                ({ label, engagementModes, retrievalMethods }) => (
                  <IOButton
                    fullWidth
                    key={label}
                    label={label}
                    onPress={() =>
                      void startFlow(engagementModes, retrievalMethods)
                    }
                  />
                )
              )}
            </>
          )}
          {status === PROXIMITY_STATUS.PRESENTING && request && (
            <>
              <IOButton
                label="Send document (base64)"
                onPress={() => void sendDocument(request, MDL_BASE64)}
              />
              <IOButton
                label="Send document (base64url)"
                onPress={() => void sendDocument(request, MDL_BASE64URL)}
              />
              <IOButton
                label="Send broken document"
                onPress={() =>
                  void sendDocument(request, MDL_BASE64.slice(0, -10))
                }
              />
              <IOButton
                label={`Send error ${ISO18013_5.ErrorCode.CBOR_DECODING} (${ISO18013_5.ErrorCode[ISO18013_5.ErrorCode.CBOR_DECODING]})`}
                onPress={() =>
                  void sendError(ISO18013_5.ErrorCode.CBOR_DECODING)
                }
              />
              <IOButton
                label={`Send error ${ISO18013_5.ErrorCode.SESSION_ENCRYPTION} (${ISO18013_5.ErrorCode[ISO18013_5.ErrorCode.SESSION_ENCRYPTION]})`}
                onPress={() =>
                  void sendError(ISO18013_5.ErrorCode.SESSION_ENCRYPTION)
                }
              />
              <IOButton
                label={`Send error ${ISO18013_5.ErrorCode.SESSION_TERMINATED} (${ISO18013_5.ErrorCode[ISO18013_5.ErrorCode.SESSION_TERMINATED]})`}
                onPress={() =>
                  void sendError(ISO18013_5.ErrorCode.SESSION_TERMINATED)
                }
              />
            </>
          )}

          {(status === PROXIMITY_STATUS.ENGAGEMENT ||
            status === PROXIMITY_STATUS.PRESENTING ||
            status === PROXIMITY_STATUS.ERROR) && (
            <IOButton
              label={"Close Engagement"}
              onPress={() =>
                void closeFlow(status === PROXIMITY_STATUS.PRESENTING)
              }
            />
          )}
        </VStack>
      </IOScrollView>
    </LoadingSpinnerOverlay>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 16
  }
});
