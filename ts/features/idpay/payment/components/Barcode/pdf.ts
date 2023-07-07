import base64js from "base64-js";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import {
  PDFDocument,
  PDFName,
  PDFNumber,
  PDFObject,
  PDFRawStream
} from "pdf-lib";
import ReactNativeBlobUtil from "react-native-blob-util";

/**
 * Represents an embedded image in a PDF document
 * @property width image width in pixels
 * @property height image height in pixels
 * @property data image data as a Uint8Array
 * @property type image type (png or jpg)
 * @property bitsPerComponent number of bits per component
 * @property isGreyScale true if the image is in grayscale, false otherwise
 */
type EmbeddedImageData = {
  width: number;
  height: number;
  data: Uint8Array;
  type: "png" | "jpg";
  bitsPerComponent: number;
  isGrayscale: boolean;
  isAlphaLayer: boolean;
};

const pdfObjectAsNumber = (object: PDFObject | undefined): number => {
  if (object instanceof PDFNumber) {
    return (object as PDFNumber).asNumber();
  }
  return 0;
};

/**
 * Get all images from a PDF document
 * @param document {@link PDFDocument} to parse
 * @returns an array of images data of type {@link EmbeddedImageData}
 */
const getEmbeddedImagesFromPDFDocument = (
  document: PDFDocument
): ReadonlyArray<EmbeddedImageData> =>
  pipe(
    document.context.enumerateIndirectObjects(),
    A.reduce([] as ReadonlyArray<EmbeddedImageData>, (images, [_, object]) => {
      if (!(object instanceof PDFRawStream)) {
        return images;
      }

      const { dict, contents } = object;

      const subtype = dict.get(PDFName.of("Subtype"));

      if (subtype !== PDFName.of("Image")) {
        return images;
      }

      const smaskRef = dict.get(PDFName.of("SMask"));
      const colorSpace = dict.get(PDFName.of("ColorSpace"));
      const width = dict.get(PDFName.of("Width"));
      const height = dict.get(PDFName.of("Height"));
      const bitsPerComponent = dict.get(PDFName.of("BitsPerComponent"));
      const filter = dict.get(PDFName.of("Filter"));
      const type = filter === PDFName.of("DCTDecode") ? "jpg" : "png";
      const isGrayscale = colorSpace === PDFName.of("DeviceGray");

      const embeddedImage: EmbeddedImageData = {
        width: pdfObjectAsNumber(width),
        height: pdfObjectAsNumber(height),
        data: contents,
        type,
        bitsPerComponent: pdfObjectAsNumber(bitsPerComponent),
        isGrayscale,
        isAlphaLayer: type === "png" && smaskRef !== undefined
      };

      return [...images, embeddedImage];
    })
  );

/**
 * Convert an {@link EmbeddedImageData} to a base64 string.
 * @param image {@link EmbeddedImageData} to convert
 * @returns a base64 string of the image
 */
const embeddedImageToBase64String = (
  image: EmbeddedImageData
): string | undefined => {
  if (image.type === "jpg") {
    // JPEG images can be directly converted to base64 strings
    return base64js.fromByteArray(image.data);
  }

  // FIXME PNG images needs a bit of work to be converted to base64 strings
  // PNG comes with a DEFLATE compression, so we need to decompress it first
  // Maybe this could help https://github.com/Hopding/pdf-lib/issues/83

  return undefined;
};

/**
 * Given a PDF file URI, extract all images data from it and returns an array of base64 strings
 * @param fileUri PDF file URI
 * @returns an array of base64 strings of the images in the PDF file
 */
export const getImagesFromPDFFile = async (
  fileUri: string
): Promise<ReadonlyArray<string>> => {
  const pdfBuffer = await ReactNativeBlobUtil.fs.readFile(fileUri, "base64");
  const document = await PDFDocument.load(pdfBuffer);
  const embeddedImages = getEmbeddedImagesFromPDFDocument(document);

  return pipe(
    embeddedImages as Array<EmbeddedImageData>,
    A.map(embeddedImageToBase64String),
    A.filterMap(O.fromNullable)
  );
};
