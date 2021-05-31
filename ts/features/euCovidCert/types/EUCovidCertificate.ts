import { IUnitTag } from "italia-ts-commons/lib/units";

type EUCovidCertificateId = string & IUnitTag<"EUCovidCertificateId">;

type BaseCertificate = {
  id: EUCovidCertificateId;
};

type QRCode = {
  mimeType: "image/png" | "image/svg";
  content: string;
};

type ValidCertificate = {
  kind: "valid";
  qrCode: QRCode;
  markdownPreview: string;
  markdownDetails: string;
};

type ExpiredCertificate = {
  kind: "expired";
};

type RevokedCertificate = {
  kind: "revoked";
  revokedOn: Date;
};

/**
 * This type represents the EU Covid Certificate with the different states & data
 */
export type EUCovidCertificate = (
  | ValidCertificate
  | ExpiredCertificate
  | RevokedCertificate
) &
  BaseCertificate;
