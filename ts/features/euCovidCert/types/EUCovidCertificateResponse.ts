import { EUCovidCertificate } from "./EUCovidCertificate";

type EUCovidCertificateResponseSuccess = {
  kind: "success";
  value: EUCovidCertificate;
};

/**
 * The required certificated is not found (403)
 */
type EUCovidCertificateResponseNotFound = {
  kind: "notFound";
};

/**
 * The required certificate have a wrong format (400)
 */
type EUCovidCertificateResponseWrongFormat = {
  kind: "wrongFormat";
};

/**
 * A generic error response was received (500, others, generic error)
 */
type EUCovidCertificateResponseGenericError = {
  kind: "genericError";
};

/**
 * The EU Covid certificate service is not operational (410)
 */
type EUCovidCertificateResponseNotOperational = {
  kind: "notOperational";
};

/**
 * The EU Covid certificate service is not operational (504)
 */
type EUCovidCertificateResponseTemporarilyNotAvailable = {
  kind: "temporarilyNotAvailable";
};

type EUCovidCertificateResponseFailure =
  | EUCovidCertificateResponseNotFound
  | EUCovidCertificateResponseWrongFormat
  | EUCovidCertificateResponseGenericError
  | EUCovidCertificateResponseNotOperational
  | EUCovidCertificateResponseTemporarilyNotAvailable;

/**
 * This type represents all the possible remote responses
 */
export type EUCovidCertificateResponse =
  | EUCovidCertificateResponseSuccess
  | EUCovidCertificateResponseFailure;
