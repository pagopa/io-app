import * as TE from "fp-ts/lib/TaskEither";
import PdfThumbnail, { ThumbnailResult } from "react-native-pdf-thumbnail";
import { BarcodeFailure } from "../types/failure";

/**
 * Creates a TaskEither that generates all the images from a PDF document
 * @param pdfUri
 * @returns
 */
export const imageGenerationTask = (
  pdfUri: string
): TE.TaskEither<BarcodeFailure, Array<ThumbnailResult>> =>
  TE.tryCatch(
    () => PdfThumbnail.generateAllPages(pdfUri, 100),
    () => ({ reason: "UNEXPECTED" })
  );
