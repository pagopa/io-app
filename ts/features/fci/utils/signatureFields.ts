import { pipe } from "fp-ts/lib/function";
import * as RA from "fp-ts/lib/ReadonlyArray";
import * as O from "fp-ts/lib/Option";
import * as S from "fp-ts/lib/string";
import * as N from "fp-ts/number";
import { contramap } from "fp-ts/lib/Ord";
import { PDFDocument, rgb } from "pdf-lib";
import ReactNativeBlobUtil from "react-native-blob-util";
import { SignatureField } from "../../../../definitions/fci/SignatureField";
import I18n from "../../../i18n";
import { TypeEnum as ClauseTypeEnum } from "../../../../definitions/fci/Clause";
import { TranslationKeys } from "../../../../locales/locales";
import { DocumentToSign } from "../../../../definitions/fci/DocumentToSign";
import { DocumentDetailView } from "../../../../definitions/fci/DocumentDetailView";
import { DrawnDocument } from "../store/reducers/fciSignatureFieldDrawing";
import { SignatureFieldToBeCreatedAttrs } from "../../../../definitions/fci/SignatureFieldToBeCreatedAttrs";
import { SignatureFieldAttrType } from "../components/DocumentWithSignature";
import { ExistingSignatureFieldAttrs } from "../../../../definitions/fci/ExistingSignatureFieldAttrs";
import { savePath } from "../saga/networking/handleDownloadDocument";

const clausesEnumValues = {
  [ClauseTypeEnum.REQUIRED]: "features.fci.signatureFields.required",
  [ClauseTypeEnum.UNFAIR]: "features.fci.signatureFields.unfair",
  [ClauseTypeEnum.OPTIONAL]: "features.fci.signatureFields.optional"
};

export const getClauseLabel = (clauseType: ClauseTypeEnum) =>
  I18n.t(`${clausesEnumValues[clauseType] as TranslationKeys}`);

export type LIST_DATA_TYPE = {
  title: string;
  data: ReadonlyArray<SignatureField>;
};

/*
 * Get the list of required signature fields
 */
export const getRequiredSignatureFields = (
  signatureFields: ReadonlyArray<SignatureField>
) =>
  clausesByType(signatureFields, [
    ClauseTypeEnum.REQUIRED,
    ClauseTypeEnum.UNFAIR
  ]);

/**
 * Get the list of optional signature fields
 */
export const getOptionalSignatureFields = (
  signatureFields: ReadonlyArray<SignatureField>
) => clausesByType(signatureFields, [ClauseTypeEnum.OPTIONAL]);

/**
 * Get the list of clauses by type
 */
export const clausesByType = (
  signatureFields: ReadonlyArray<SignatureField>,
  clauseType: ReadonlyArray<string>
) =>
  pipe(
    signatureFields,
    RA.filterMap(signatureField =>
      clauseType.includes(signatureField.clause.type)
        ? O.fromNullable(signatureField)
        : O.none
    )
  );

/**
 * Get the list of all types for the signature fields
 * of the current document
 */
export const getAllTypes = (signatureFields: ReadonlyArray<SignatureField>) =>
  pipe(
    signatureFields,
    RA.filterMap(signatureField => O.fromNullable(signatureField.clause.type)),
    RA.uniq(S.Eq)
  );

/**
 * Giving a list of signature fields, it returns the DATA
 * to rendering the SectionList
 */
export const getSectionListData = (
  signatureFields: ReadonlyArray<SignatureField>
): ReadonlyArray<LIST_DATA_TYPE> =>
  pipe(
    getAllTypes(signatureFields),
    RA.map(type => ({
      title: type,
      data: clausesByType(signatureFields, [type])
    }))
  );

/**
 * Defines a total ordering for the signature field type: UNFAIR -> REQURED -> EVERYTHING ELSE (OPTIONAL)
 */
const byClausesType = pipe(
  N.Ord,
  contramap((signatureField: SignatureField) => {
    switch (signatureField.clause.type) {
      case ClauseTypeEnum.UNFAIR:
        return 0;
      case ClauseTypeEnum.REQUIRED:
        return 1;
      case ClauseTypeEnum.OPTIONAL:
        return 2;
      default:
        return 3;
    }
  })
);

/**
 * Defines a read only array sorting by using the total ordering byClausesType
 */
const sortByType = RA.sortBy([byClausesType]);

/**
 * Orders the signatureFields array with the given order: UNFAIR -> REQURED -> EVERYTHING ELSE (OPTIONAL)
 * @param signatureFields an array of signature fields
 * @returns the new ordered array
 */
export const orderSignatureFields = (
  signatureFields: ReadonlyArray<SignatureField>
): ReadonlyArray<SignatureField> => pipe(signatureFields, sortByType);

/**
 * Given a list of documents to sign and an array of Clauses types
 * it returns the number of clauses.
 * @param documentsToSign the list of documents to sign
 * @returns the number of OPTIONAL clauses
 */
export const getClausesCountByTypes = (
  documentsToSign: ReadonlyArray<DocumentToSign>,
  clausesType: ReadonlyArray<string>
): number =>
  pipe(
    documentsToSign,
    RA.chain(d => d.signature_fields),
    RA.filterMap(f =>
      clausesType.includes(f.clause.type) ? O.some(f) : O.none
    ),
    RA.size
  );

/**
 * Get the number of signature fields.
 * @param doc the document detail view
 * @returns the number of signature fields
 */
export const getSignatureFieldsLength = (doc: DocumentDetailView) =>
  pipe(
    doc,
    O.fromNullable,
    O.map(_ => _.metadata.signature_fields),
    O.map(_ => _.length),
    O.getOrElse(() => 0)
  );

/**
 * Adds a base 64 PDF uri scheme to a base64 string representation of a PDF.
 * @param r the base64 string representation of a PDF
 * @returns r prexied by the uri scheme
 */
const addBase64PdfUriScheme = (r: string) => `data:application/pdf;base64,${r}`;

/**
 * Parses a PDF from filesystem as a base64 string with the prefixed uri scheme.
 * @param uri the uri of the PDF
 * @returns a base64 string representation of the PDF at uri
 */
export const parsePdfAsBase64 = async (uri: string) => {
  const parsed = await ReactNativeBlobUtil.fs.readFile(
    `${savePath(uri)}`,
    "base64"
  );
  return addBase64PdfUriScheme(parsed);
};

/**
 * Converts a PDFDocument instance to a base64 string representation with the prefixed URI scheme.
 * @param parsedPdf the PDFDocument instance
 * @returns a base64 string repreesntation with the prefixed URI scheme
 */
const savePdfDocumentoAsBase64 = async (parsedPdf: PDFDocument) => {
  const res = await parsedPdf.saveAsBase64();
  return addBase64PdfUriScheme(res);
};

/**
 * Get the pdf url from documents, download it as base64 string and load the pdf as pdf-lib object to draw a rect over the signature field.
 * @param uniqueName the of the signature field
 * @param bytes the pdf representation
 * @returns a promise of an output document with the drawn box and the field page
 */
const drawRectangleOverSignatureFieldById = async (
  bytes: string,
  uniqueName: string
): Promise<DrawnDocument> => {
  const parsedPdf = await PDFDocument.load(addBase64PdfUriScheme(bytes));
  const pageRef = parsedPdf.findPageForAnnotationRef(
    parsedPdf.getForm().getSignature(uniqueName).ref
  );
  if (pageRef) {
    const page = parsedPdf.getPages().indexOf(pageRef);
    // The signature field is extracted by its unique_name.
    // Using low-level acrofield (acrobat field) it is possible
    // to obtain the elements of the signature field such as the
    // box that contains it. Once the box is obtained, its
    // coordinates are used to draw a rectangle on the related page.
    const signature = parsedPdf.getForm().getSignature(uniqueName);
    const [widget] = signature.acroField.getWidgets();
    const rect = widget.getRectangle();
    parsedPdf.getPage(page).drawRectangle({
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      color: rgb(0, 0.77, 0.79),
      opacity: 0.5,
      borderOpacity: 0.75
    });
    return {
      document: await savePdfDocumentoAsBase64(parsedPdf),
      page
    };
  } else {
    throw new Error(); // TODO: refactor with fp-ts https://pagopa.atlassian.net/browse/SFEQS-1601
  }
};

/**
 * Get the pdf url from documents,
 * download it as base64 string and
 * load the pdf as pdf-lib object
 * to draw a rect over the signature field
 * giving a set of coordinates
 * @param attrs the signature field attrs containing the coords
 * @param bytes the pdf representation
 * @returns a promise of an output document with the drawn box and the field page
 */
const drawRectangleOverSignatureFieldByCoordinates = async (
  bytes: string,
  attrs: SignatureFieldToBeCreatedAttrs
): Promise<DrawnDocument> => {
  const parsedPdf = await PDFDocument.load(addBase64PdfUriScheme(bytes));
  const page = attrs.page;
  parsedPdf.getPage(page).drawRectangle({
    x: attrs.bottom_left.x ?? 0,
    y: attrs.bottom_left.y ?? 0,
    height: Math.abs((attrs.top_right.y ?? 0) - (attrs.bottom_left.y ?? 0)),
    width: Math.abs((attrs.top_right.x ?? 0) - (attrs.bottom_left.x ?? 0)),
    color: rgb(0, 0.77, 0.79),
    opacity: 0.5,
    borderOpacity: 0.75
  });
  return {
    document: await savePdfDocumentoAsBase64(parsedPdf),
    page
  };
};

/**
 * Draws a box on a signature field.
 * @param bytes the pdf bytes representation
 * @param attrs the signature field attributes
 * @returns a promise of an output document with the drawn box and the field page
 */
export const drawSignatureField = async (
  bytes: string,
  attrs: ExistingSignatureFieldAttrs | SignatureFieldToBeCreatedAttrs
) => {
  if (hasUniqueName(attrs)) {
    return await drawRectangleOverSignatureFieldById(bytes, attrs.unique_name);
  } else {
    return await drawRectangleOverSignatureFieldByCoordinates(bytes, attrs);
  }
};

/**
 * Checks if the signature field attribute has a unique name or not (coords)
 * @param f the signature field attributes
 * @returns true if the signature field has a unique name, false otherwise
 */
export const hasUniqueName = (
  f: SignatureFieldAttrType
): f is ExistingSignatureFieldAttrs =>
  (f as ExistingSignatureFieldAttrs).unique_name !== undefined;
