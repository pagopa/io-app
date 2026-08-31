import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { Response } from "express";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import fs from "fs";
import { Validation } from "io-ts";

import { unknownToString } from "./error";

export const sendFileFromRootPath = (filePath: string, res: Response) => {
  res.sendFile(filePath, {
    root: "."
  });
};

const readBinaryFileSegment = (
  filename: string,
  length: number
): E.Either<string, Buffer> => {
  try {
    const fileDescriptor = fs.openSync(filename, "r");
    const buffer = Buffer.alloc(length);
    const byteRead = fs.readSync(fileDescriptor, buffer);
    if (byteRead === 0) {
      return E.left(`Unable to read (${length}) bytes from file (${filename})`);
    }
    return E.right(buffer);
  } catch (e) {
    return E.left(unknownToString(e));
  }
};

export const isPDFFile = (fileName: string): E.Either<string, boolean> => {
  const bufferEither = readBinaryFileSegment(fileName, 4);
  if (E.isLeft(bufferEither)) {
    return bufferEither;
  }
  const buffer = bufferEither.right;
  const fileHeader = buffer.toString("utf8", 0, buffer.length);
  return E.right(fileHeader === "%PDF");
};

export const readFileAsJSON = (fileName: string): any =>
  fs.existsSync(fileName)
    ? JSON.parse(fs.readFileSync(fileName).toString())
    : null;

export const fileExists = (filePath: string) => fs.existsSync(filePath);

export const listDir = (directoryPath: string): Array<string> => {
  try {
    return fs.readdirSync(directoryPath);
  } catch {
    return [];
  }
};

/**
 * Read a file, try to decode and transform the result in a response
 * @param filename
 * @param decode
 * @param res
 */
export const readFileAndDecode = <T>(
  filename: string,
  decode: (i: T) => Validation<T>,
  res: Response
): Response =>
  pipe(
    readFileAsJSON(filename),
    decode,
    E.fold(
      errors => res.status(500).send(readableReport(errors)),
      v => res.json(v)
    )
  );

export const contentTypeMapping: Record<string, string> = {
  pdf: "application/pdf",
  jpeg: "image/jpeg",
  jpg: "image/jpg",
  png: "image/png",
  zip: "application/zip"
};

export const isPngOrJpegExtension = (inputString?: string) => {
  const lowerCaseInputString = inputString?.toLowerCase() ?? "";
  return (
    lowerCaseInputString.endsWith(".png") ||
    lowerCaseInputString.endsWith(".jpg") ||
    lowerCaseInputString.endsWith(".jpeg")
  );
};
