import { z } from "zod";

/**
 * Represent the key of the alert message that can be set during the CIE reading
 * process
 *
 * **Note**: Alert messages are only available on iOS
 */
export const AlertMessageKey = z.enum([
  "readingInstructions",
  "moreTags",
  "readingInProgress",
  "readingSuccess",
  "invalidCard",
  "tagLost",
  "cardLocked",
  "wrongPin1AttemptLeft",
  "wrongPin2AttemptLeft",
  "genericError",
  "wrongCan"
]);

export type AlertMessageKey = z.infer<typeof AlertMessageKey>;

/**
 * Event emitted during the CIE reading process with the name of the event and
 * the progress of the reading up to that point. Event names may differ based on
 * the platform.
 */
export const NfcEvent = z.object({
  name: z.string(),
  progress: z.coerce.number()
});

export type NfcEvent = z.infer<typeof NfcEvent>;

/** Name of the error emitted during the CIE reading process */
export const NfcErrorName = z.enum([
  "NOT_A_CIE",
  "TAG_LOST",
  "CANCELLED_BY_USER",
  "APDU_ERROR",
  "WRONG_PIN",
  "WRONG_CAN",
  "CARD_BLOCKED",
  "NO_INTERNET_CONNECTION",
  "CERTIFICATE_EXPIRED",
  "CERTIFICATE_REVOKED",
  "AUTHENTICATION_ERROR",
  "GENERIC_ERROR"
]);

export type NfcErrorName = z.infer<typeof NfcErrorName>;

/** Represent an NFC error emitted during the CIE reading process */
export const NfcError = z.union([
  z.object({
    name: NfcErrorName.exclude(["WRONG_PIN"]),
    message: z.string().optional()
  }),
  // WRONG_PIN error also contains the number of attempts left
  z.object({
    name: NfcErrorName.extract(["WRONG_PIN"]),
    message: z.string().optional(),
    attemptsLeft: z.number()
  })
]);

export type NfcError = z.infer<typeof NfcError>;

/**
 * Represent the CIE response coming from NIS Internal Auth All string value are
 * Hex or Base64 encoded
 */
export const InternalAuthResponseObject = z.object({
  nis: z.string(),
  publicKey: z.string(),
  sod: z.string(),
  signedChallenge: z.string()
});

export type InternalAuthResponse = z.infer<typeof InternalAuthResponseObject>;

/**
 * Represent the CIE response coming from MRTD with PACE reading All string
 * value are Hex or Base64 encoded
 */
export const MrtdResponseObject = z.object({
  dg1: z.string(),
  dg11: z.string(),
  sod: z.string()
});

export type MrtdResponse = z.infer<typeof MrtdResponseObject>;

/**
 * Represent the CIE response coming from NIS Internal Auth and MRTD with PACE
 * reading during the same NFC session. All string value are Hex or Base64
 * encoded
 */
export const InternalAuthAndMrtdResponse = z.object({
  nis_data: InternalAuthResponseObject,
  mrtd_data: MrtdResponseObject
});

export type InternalAuthAndMrtdResponse = z.infer<
  typeof InternalAuthAndMrtdResponse
>;

/** Represent the CIE attributes containing the CIE type */
export const CieAttributes = z.object({
  type: z.string(),
  base64: z.string()
});

export type CieAttributes = z.infer<typeof CieAttributes>;

export const CertificateData = z.object({
  name: z.string().optional(),
  surname: z.string().optional(),
  fiscalCode: z.string().optional(),
  docSerialNumber: z.string().optional()
});

export type CertificateData = z.infer<typeof CertificateData>;

/** Possible events that can be listened to */
export type CieEvent = keyof CieEventHandlers;

/**
 * Event handler that can be used to handle the CIE events during the reading
 * process
 */
export type CieEventHandlers = {
  onAttributesSuccess: (attributes: CieAttributes) => void;
  onCertificateSuccess: (certificateData: CertificateData) => void;
  onError: (error: NfcError) => void;
  onEvent: (event: NfcEvent) => void;
  onInternalAuthAndMRTDWithPaceSuccess: (
    internalAuthAndMrtdResponse: InternalAuthAndMrtdResponse
  ) => void;
  onInternalAuthenticationSuccess: (
    internalAuthResponse: InternalAuthResponse
  ) => void;
  onMRTDWithPaceSuccess: (mrtdResponse: MrtdResponse) => void;
  onSuccess: (uri: string) => void;
};

/** Possible encodings for the CIE reading results */
export type ResultEncoding = "base64" | "base64url" | "hex";
