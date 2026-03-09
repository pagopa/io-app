import { NativeModules } from "react-native";

const { PdfHighResGenerator } = NativeModules;

interface PdfHighResGeneratorInterface {
  /**
   * Generate high-resolution images from a PDF file.
   * @param filePath The absolute path of the PDF file (e.g., file:///...)
   * @param scale The scale factor. 1.0 = 72DPI. 3.0 = ~216DPI (Ideal for dense QR codes).
   * @returns Promise with an array of strings (paths of the generated images).
   */
  generate(filePath: string, scale: number): Promise<Array<[]>>;
}

export default PdfHighResGenerator as PdfHighResGeneratorInterface;
