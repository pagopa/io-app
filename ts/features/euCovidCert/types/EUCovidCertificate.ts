import { IUnitTag } from "italia-ts-commons/lib/units";

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

export type WithCertificateHeaderData = {
  headerData: {
    title: string;
    subTitle: string;
    logoId: string;
  };
};

export type ValidCertificate = WithEUCovidCertificateId &
  WithCertificateHeaderData & {
    kind: "valid";
    qrCode: QRCode;
    markdownInfo?: string;
    markdownDetails?: string;
  };

export type RevokedCertificate = WithEUCovidCertificateId &
  WithCertificateHeaderData & {
    kind: "revoked";
    markdownInfo?: string;
    revokedOn?: Date;
  };

type ExpiredCertificate = WithEUCovidCertificateId &
  WithCertificateHeaderData & {
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
