import { NativeModules, Platform } from "react-native";

const { QRCodeGenerator } = NativeModules;

/**
 * Generates a QR code image using the native platform implementation:
 * - iOS: Core Image (CIFilter.qrCodeGenerator, ECL H)
 * - Android: ZXing QRCodeWriter (ECL H)
 *
 * @param data - The string to encode
 * @param size - The output image size in pixels
 * @returns A base64 data URI: "data:image/png;base64,..."
 */
export const generateNativeQRCode = (
  data: string,
  size: number
): Promise<string> => {
  if (!QRCodeGenerator) {
    return Promise.reject(
      new Error(
        `QRCodeGenerator native module not found on ${Platform.OS}. ` +
          "Rebuild the app after adding the native files to the project."
      )
    );
  }
  return QRCodeGenerator.generate(data, size);
};
