import { requireNativeModule } from "expo-modules-core";

interface ExpoPdfHighResGeneratorModule {
  generate: (filePath: string, scale: number) => Promise<Array<string>>;
}

const ExpoPdfHighResGenerator =
  requireNativeModule<ExpoPdfHighResGeneratorModule>("ExpoPdfHighResGenerator");

/**
 * Renders every page of the PDF at `filePath` to a high resolution JPEG and returns the `file://` URIs.
 */
export const generatePdfHighResImages = (
  filePath: string,
  scale: number
): Promise<Array<string>> => ExpoPdfHighResGenerator.generate(filePath, scale);
