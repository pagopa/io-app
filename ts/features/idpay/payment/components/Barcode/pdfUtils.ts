import { PDFDocument, PDFName, PDFRawStream } from "pdf-lib";
import ReactNativeBlobUtil from "react-native-blob-util";

export const extractImagesDataFromPDF = async (
  fileUri: string
): Promise<ReadonlyArray<string>> => {
  const pdfBuffer = await ReactNativeBlobUtil.fs.readFile(fileUri, "base64");
  const document = await PDFDocument.load(pdfBuffer);
  const objects = document.context.enumerateIndirectObjects();

  return objects.reduce((acc, [_pdfRef, pdfObject]) => {
    if (!(pdfObject instanceof PDFRawStream)) {
      return acc;
    }
    const { dict } = pdfObject;

    const subtype = dict.get(PDFName.of("Subtype"));

    if (subtype !== PDFName.of("Image")) {
      return acc;
    }

    /*
    const colorSpace = dict.get(PDFName.of("ColorSpace"));
    const width = dict.get(PDFName.of("Width"));
    const height = dict.get(PDFName.of("Height"));
    const bitsPerComponent = dict.get(PDFName.of("BitsPerComponent"));
    const filter = dict.get(PDFName.of("Filter"));
    const type = filter === PDFName.of("DCTDecode") ? "jpg" : "png";


    console.log(
      "\n  Type:",
      type,
      "\n  Color Space:",
      colorSpace?.toString(),
      "\n  Width:",
      width,
      "\n  Height:",
      height,
      "\n  Bits Per Component:",
      bitsPerComponent,
      "\n  Data:",
      `Uint8Array(${pdfObject.contents.length})`
    );
    */

    const b64encoded = Buffer.from(pdfObject.contents).toString("base64");
    return [...acc, b64encoded];
  }, [] as ReadonlyArray<string>);
};
