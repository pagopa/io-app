export interface ValidationCode {
  mandateId: string;
  mandateTimeToLive: Date;
  notificationIUN: string;
  qrCodeContent: string;
  validationCode: string;
  validationCodeTimeToLive: Date;
}
