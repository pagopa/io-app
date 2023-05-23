import { pipe } from "fp-ts/lib/function";
import * as RA from "fp-ts/lib/ReadonlyArray";
import * as O from "fp-ts/lib/Option";
import * as S from "fp-ts/lib/string";
import * as N from "fp-ts/number";
import { contramap } from "fp-ts/lib/Ord";
import { SignatureField } from "../../../../definitions/fci/SignatureField";
import I18n from "../../../i18n";
import { TypeEnum as ClauseTypeEnum } from "../../../../definitions/fci/Clause";
import { TranslationKeys } from "../../../../locales/locales";
import { DocumentDetailView } from "../../../../definitions/fci/DocumentDetailView";

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
 * Get the number of signature fields
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
