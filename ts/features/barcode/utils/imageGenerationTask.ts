import { NativeModules } from "react-native";
import * as TE from "fp-ts/lib/TaskEither";
import { BarcodeFailure } from "../types/failure";

interface PdfHighResGeneratorType {
  generate(filePath: string, scale: number): Promise<Array<string>>;
}

const PdfHighResGenerator =
  NativeModules.PdfHighResGenerator as PdfHighResGeneratorType;

/**
 * Creates a TaskEither that generates all the images from a PDF document
 * using the Native Module for High Resolution rendering (Scale 3.0).
 */
export const imageGenerationTask = (
  pdfUri: string
): TE.TaskEither<BarcodeFailure, Array<{ uri: string }>> =>
  TE.tryCatch(
    async () => {
      // Scale 3 => ~216DPI (Ideal for dense QR codes)
      const paths: Array<string> = await PdfHighResGenerator.generate(
        pdfUri,
        3
      );
      return paths.map(path => ({ uri: path }));
    },
    error => ({ reason: `UNEXPECTED${error}` } as BarcodeFailure)
  );
