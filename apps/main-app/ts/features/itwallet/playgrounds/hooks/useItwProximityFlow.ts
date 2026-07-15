/* eslint-disable functional/immutable-data */
import {
  type CryptoError,
  deleteKey,
  generate
} from "@pagopa/io-react-native-crypto";
import {
  CBOR,
  COSE,
  ISO18013_5,
  ISO18013_7
} from "@pagopa/io-react-native-iso18013";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Platform } from "react-native";
import {
  checkMultiple,
  type Permission,
  PERMISSIONS,
  requestMultiple,
  RESULTS
} from "react-native-permissions";

import { getEnv } from "../../common/utils/environment";
import { KEYTAG, WELL_KNOWN_CREDENTIALS } from "../mocks/proximity";

interface NestedBooleanMap {
  [key: string]: boolean | NestedBooleanMap;
}

const acceptAllFields = <T extends NestedBooleanMap>(input: T): T =>
  Object.entries(input).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]:
        typeof value === "boolean"
          ? true
          : typeof value === "object" && value !== null
            ? acceptAllFields(value)
            : value
    }),
    {} as T
  );

const generateAcceptedFields = (
  request: ISO18013_5.VerifierRequest["request"]
): ISO18013_5.AcceptedFields =>
  Object.entries(request).reduce(
    (acc, [docType, { isAuthenticated, certificateData, ...namespaces }]) => ({
      ...acc,
      [docType]: acceptAllFields(namespaces)
    }),
    {}
  );

const generateKeyIfNotExists = async (keyTag: string) => {
  await deleteKey(keyTag).catch(e => {
    const { message } = e as CryptoError;

    if (message !== "PUBLIC_KEY_NOT_FOUND") {
      throw e;
    }
  });

  await generate(keyTag);
};

const isRequestMdl = (requestKeys: Array<string>) => {
  if (requestKeys.length !== 1) {
    throw new Error("Unexpected request keys. Expected only one key.");
  }

  if (requestKeys[0] !== WELL_KNOWN_CREDENTIALS.mdl) {
    throw new Error("Unexpected request key. Expected only mDL.");
  }
};

const requestBlePermissions = async (): Promise<boolean> => {
  const permissionsToCheck: Array<Permission> =
    Platform.OS === "android"
      ? Platform.Version >= 31
        ? [
            PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
            PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
            PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE
          ]
        : [PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION]
      : [PERMISSIONS.IOS.BLUETOOTH];

  try {
    const statuses = await checkMultiple(permissionsToCheck);
    const permissionsToRequest = permissionsToCheck.filter(
      permission => statuses[permission] !== RESULTS.GRANTED
    );

    if (permissionsToRequest.length > 0) {
      const requestResults = await requestMultiple(permissionsToRequest);

      return permissionsToRequest.every(
        permission => requestResults[permission] === RESULTS.GRANTED
      );
    }

    return true;
  } catch {
    return false;
  }
};

const parseAndPrintError = (
  schema:
    | typeof CBOR.ModuleErrorSchema
    | typeof COSE.ModuleErrorSchema
    | typeof ISO18013_5.ModuleErrorSchema
    | typeof ISO18013_5.OnErrorPayloadSchema
    | typeof ISO18013_7.ModuleErrorSchema,
  error: unknown,
  prefix?: string
) => {
  const parsedError = schema.safeParse(error);
  const message = parsedError.success
    ? prefix
      ? `${prefix}: ${JSON.stringify(parsedError.data, null, 2)}`
      : JSON.stringify(parsedError.data, null, 2)
    : (prefix ?? "Unexpected playground error");

  Alert.alert("An error occurred", message);
};

/**
 * Proximity status enum to track the current state of the flow.
 * - IDLE: No flow active.
 * - READY: Permissions granted, waiting for engagement selection.
 * - ENGAGEMENT: Engagement active.
 * - PRESENTING: Verifier has requested a document.
 * - ERROR: An error occurred.
 */
export enum PROXIMITY_STATUS {
  ENGAGEMENT = "ENGAGEMENT",
  ERROR = "ERROR",
  IDLE = "IDLE",
  PRESENTING = "PRESENTING",
  READY = "READY"
}

export const useItwProximityFlow = () => {
  const [status, setStatus] = useState<PROXIMITY_STATUS>(PROXIMITY_STATUS.IDLE);
  const [qrCode, setQrCode] = useState<null | string>(null);
  const [request, setRequest] = useState<
    ISO18013_5.VerifierRequest["request"] | null
  >(null);
  const isNfcEnabled = useRef<boolean>(false);
  const retrievalMethod = useRef<ISO18013_5.RetrievalMethod | undefined>(
    undefined
  );
  const env = getEnv("pre");

  const handleQrCodeString = useCallback(
    (payload: ISO18013_5.EventsPayload["onQrCodeString"]) => {
      ISO18013_5.setHceModalMessage("onQrCodeString");
      setQrCode(payload.data);
    },
    []
  );

  const handleNfcStarted = useCallback(() => {
    ISO18013_5.setHceModalMessage("onNfcStarted");
    isNfcEnabled.current = true;
  }, []);

  const handleNfcStopped = useCallback(() => {
    ISO18013_5.setHceModalMessage("onNfcStopped");
    isNfcEnabled.current = false;
  }, []);

  const handleOnDeviceConnecting = useCallback(() => {
    ISO18013_5.setHceModalMessage("onDeviceConnecting");
  }, []);

  const handleOnDeviceConnected = useCallback(() => {
    ISO18013_5.setHceModalMessage("onDeviceConnected");
  }, []);

  const init = useCallback(async () => {
    setStatus(PROXIMITY_STATUS.IDLE);
    const hasPermission = await requestBlePermissions();
    if (!hasPermission) {
      Alert.alert(
        "Permission Required",
        "BLE permissions are needed to proceed."
      );
      return;
    }
    setStatus(PROXIMITY_STATUS.READY);
  }, []);

  useEffect(() => {
    void init();
  }, [init]);

  const startFlow = useCallback(
    async (
      engagementModes?: ReadonlyArray<ISO18013_5.EngagementMode>,
      retrievalMethods?: ReadonlyArray<ISO18013_5.RetrievalMethod>
    ) => {
      try {
        await ISO18013_5.startEngagement({
          engagementModes,
          retrievalMethods,
          certificates: [[env.X509_CERT_ROOT]]
        });
        setStatus(PROXIMITY_STATUS.ENGAGEMENT);
      } catch (e) {
        parseAndPrintError(
          ISO18013_5.ModuleErrorSchema,
          e,
          "startNfcEngagement error: "
        );
      }
    },
    [env]
  );

  const closeFlow = useCallback(async (sendError = false) => {
    try {
      if (sendError) {
        await ISO18013_5.sendErrorResponse(
          ISO18013_5.ErrorCode.SESSION_TERMINATED
        );
      }
      await ISO18013_5.close();

      retrievalMethod.current = undefined;
      isNfcEnabled.current = false;

      setQrCode(null);
      setRequest(null);
      setStatus(PROXIMITY_STATUS.READY);
    } catch (e) {
      parseAndPrintError(ISO18013_5.ModuleErrorSchema, e, "closeFlow error: ");
    }
  }, []);

  const sendError = useCallback(
    async (errorCode: ISO18013_5.ErrorCode) => {
      try {
        await ISO18013_5.sendErrorResponse(errorCode);
        await closeFlow();
      } catch (e) {
        parseAndPrintError(
          ISO18013_5.ModuleErrorSchema,
          e,
          "sendError error: "
        );
      }
    },
    [closeFlow]
  );

  const sendDocument = useCallback(
    async (
      verifierRequest: ISO18013_5.VerifierRequest["request"],
      mdl: string
    ) => {
      try {
        await generateKeyIfNotExists(KEYTAG);
        const documents: Array<ISO18013_5.RequestedDocument> = [
          {
            alias: KEYTAG,
            docType: WELL_KNOWN_CREDENTIALS.mdl,
            issuerSignedContent: mdl
          }
        ];

        const acceptedFields = generateAcceptedFields(verifierRequest);
        const result = await ISO18013_5.generateResponse(
          documents,
          acceptedFields
        );
        await ISO18013_5.sendResponse(result);
      } catch (e) {
        parseAndPrintError(
          ISO18013_5.ModuleErrorSchema,
          e,
          "sendDocument error: "
        );
      }
    },
    []
  );

  const onDocumentRequestReceived = useCallback(
    async (payload: ISO18013_5.EventsPayload["onDocumentRequestReceived"]) => {
      ISO18013_5.setHceModalMessage("onDocumentRequestReceived");
      try {
        if (!payload || !payload.data) {
          return;
        }
        // String -> JSON
        const parsedJson = JSON.parse(payload.data);

        // JSON -> VerifierRequest
        const parsedResponse = ISO18013_5.parseVerifierRequest(parsedJson);

        // Remove WIA from request, if verifier is requesting it
        // We don't have it and it's not needed for the demo
        const {
          [WELL_KNOWN_CREDENTIALS.walletAttestation]: _,
          ...requestedDocuments
        } = parsedResponse.request;

        isRequestMdl(Object.keys(requestedDocuments));

        retrievalMethod.current = payload.retrievalMethod;
        setRequest(parsedResponse.request);
        setStatus(PROXIMITY_STATUS.PRESENTING);
      } catch (e) {
        parseAndPrintError(
          ISO18013_5.ModuleErrorSchema,
          e,
          "onDocumentRequestReceived error: "
        );
        void sendError(ISO18013_5.ErrorCode.SESSION_TERMINATED);
      }
    },
    [sendError]
  );

  const onDeviceDisconnected = useCallback(async () => {
    ISO18013_5.setHceModalMessage("onDeviceDisconnected");
    Alert.alert("Device disconnected", "Check the verifier app");
    await closeFlow();
  }, [closeFlow]);

  const onError = useCallback(
    async (data: ISO18013_5.EventsPayload["onError"]) => {
      ISO18013_5.setHceModalMessage("onError");
      try {
        if (!data || !data.error) {
          throw new Error("No error data received");
        }
        parseAndPrintError(
          ISO18013_5.OnErrorPayloadSchema,
          data.error,
          "Error event: "
        );
      } catch (e) {
        parseAndPrintError(ISO18013_5.ModuleErrorSchema, e, "onError error: ");
      } finally {
        await closeFlow();
      }
    },
    [closeFlow]
  );

  useEffect(() => {
    const listeners = [
      ISO18013_5.addListener("onQrCodeString", handleQrCodeString),
      ISO18013_5.addListener("onNfcStarted", handleNfcStarted),
      ISO18013_5.addListener("onNfcStopped", handleNfcStopped),
      ISO18013_5.addListener("onDeviceConnecting", handleOnDeviceConnecting),
      ISO18013_5.addListener("onDeviceConnected", handleOnDeviceConnected),
      ISO18013_5.addListener(
        "onDocumentRequestReceived",
        onDocumentRequestReceived
      ),
      ISO18013_5.addListener("onDeviceDisconnected", onDeviceDisconnected),
      ISO18013_5.addListener("onError", onError)
    ];

    return () => {
      listeners.forEach(listener => {
        listener.remove();
      });
    };
  }, [
    handleQrCodeString,
    handleNfcStarted,
    handleNfcStopped,
    handleOnDeviceConnecting,
    handleOnDeviceConnected,
    onDocumentRequestReceived,
    onDeviceDisconnected,
    onError
  ]);

  // Close the engagement only on unmount
  useEffect(
    () => () => {
      ISO18013_5.close().catch(e => {
        parseAndPrintError(ISO18013_5.ModuleErrorSchema, e, "cleanup error: ");
      });
    },
    []
  );

  return {
    status,
    qrCode,
    request,
    isNfcEnabled: isNfcEnabled.current,
    retrievalMethod: retrievalMethod.current,
    startFlow,
    closeFlow,
    sendDocument,
    sendError
  };
};
