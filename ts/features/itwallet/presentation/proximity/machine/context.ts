export type Context = {
  /**
   * The string used to generate the QR Code
   */
  qrCodeString?: string;
  /**
   * A boolean value indicating whether an error occurs
   * during the `qrCodeString` generation process
   */
  isQRCodeGenerationError?: boolean;
};

export const InitialContext: Context = {};
