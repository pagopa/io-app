import { pipe } from "fp-ts/lib/function";
import * as RA from "fp-ts/lib/ReadonlyArray";
import * as O from "fp-ts/lib/Option";
import * as S from "fp-ts/lib/string";
import { SignatureField } from "../../../../definitions/fci/SignatureField";
import I18n from "../../../i18n";
import { TypeEnum as ClauseTypeEnum } from "../../../../definitions/fci/Clause";
import { TranslationKeys } from "../../../../locales/locales";

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
