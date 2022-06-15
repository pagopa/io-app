import { IUnitTag } from "@pagopa/ts-commons/lib/units";

/**
 * The unique ID of a EU Covid Certificate
 */
export type EUCovidCertificateId = string & IUnitTag<"EUCovidCertificateId">;

/**
 * The auth code used to request the EU Covid Certificate, received via message
 */
export type EUCovidCertificateAuthCode = string &
  IUnitTag<"EUCovidCertificateAuthCode">;

type WithEUCovidCertificateId = {
  id?: EUCovidCertificateId;
};

type QRCode = {
  mimeType: "image/png" | "image/svg";
  content: string;
};

export type WithEUCovidCertificateHeaderData = {
  headerData: {
    title: string;
    subTitle: string;
    logoUrl: string;
  };
};

export type ValidCertificate = WithEUCovidCertificateId &
  WithEUCovidCertificateHeaderData & {
    kind: "valid";
    qrCode: QRCode;
    markdownInfo?: string;
    markdownDetails?: string;
  };

export type RevokedCertificate = WithEUCovidCertificateId &
  WithEUCovidCertificateHeaderData & {
    kind: "revoked";
    markdownInfo?: string;
    revokedOn?: Date;
  };

export type ExpiredCertificate = WithEUCovidCertificateId &
  WithEUCovidCertificateHeaderData & {
    kind: "expired";
    markdownInfo?: string;
  };

/**
 * This type represents the EU Covid Certificate with the different states & data
 */
export type EUCovidCertificate =
  | ValidCertificate
  | RevokedCertificate
  | ExpiredCertificate;
