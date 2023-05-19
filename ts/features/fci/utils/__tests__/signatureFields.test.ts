import { TypeEnum as ClausesTypeEnum } from "../../../../../definitions/fci/Clause";
import { SignatureField } from "../../../../../definitions/fci/SignatureField";
import I18n from "../../../../i18n";
import {
  clausesByType,
  getAllTypes,
  getClauseLabel,
  getClausesCountByTypes,
  getOptionalSignatureFields,
  getRequiredSignatureFields,
  getSectionListData,
  orderSignatureFields
} from "../signatureFields";
import { mockCreateSignatureBody } from "../../types/__mocks__/CreateSignatureBody.mock";

const emptyAttrs = {} as SignatureField["attrs"];

const signatureFields: ReadonlyArray<SignatureField> = [
  {
    clause: {
      title: "clause title 1",
      type: ClausesTypeEnum.REQUIRED
    },
    attrs: emptyAttrs
  },
  {
    clause: {
      title: "clause title 2",
      type: ClausesTypeEnum.UNFAIR
    },
    attrs: emptyAttrs
  },
  {
    clause: {
      title: "clause title 3",
      type: ClausesTypeEnum.OPTIONAL
    },
    attrs: emptyAttrs
  },
  {
    clause: {
      title: "clause title 4",
      type: ClausesTypeEnum.OPTIONAL
    },
    attrs: emptyAttrs
  }
];

const requiredSignatureFields = [
  {
    clause: {
      title: "clause title 1",
      type: ClausesTypeEnum.REQUIRED
    },
    attrs: emptyAttrs
  },
  {
    clause: {
      title: "clause title 2",
      type: ClausesTypeEnum.UNFAIR
    },
    attrs: emptyAttrs
  }
];

const optionalSignatureFields = [
  {
    clause: {
      title: "clause title 3",
      type: ClausesTypeEnum.OPTIONAL
    },
    attrs: emptyAttrs
  },
  {
    clause: {
      title: "clause title 4",
      type: ClausesTypeEnum.OPTIONAL
    },
    attrs: emptyAttrs
  }
];

const reqAndOptSignatureFields = [
  {
    clause: {
      title: "clause title 3",
      type: ClausesTypeEnum.OPTIONAL
    },
    attrs: emptyAttrs
  },
  {
    clause: {
      title: "clause title 1",
      type: ClausesTypeEnum.REQUIRED
    },
    attrs: emptyAttrs
  }
];

describe("Test signatureFields utils", () => {
  describe("Test clausesByType", () => {
    it("it should returns an empty array with an empty signatureFields as input", () => {
      expect(clausesByType([], [ClausesTypeEnum.REQUIRED])).toStrictEqual([]);
    });
    it("it should returns an empty array with an invalid clause type", () => {
      expect(clausesByType([], ["INVALID_TYPE"])).toStrictEqual([]);
    });
    it("it should returns an array with one item if clause type equal to REQUIRED", () => {
      expect(
        clausesByType(signatureFields, [ClausesTypeEnum.REQUIRED]).length
      ).toBe(1);
      expect(
        clausesByType(signatureFields, [ClausesTypeEnum.REQUIRED])
      ).toStrictEqual([signatureFields[0]]);
    });
    it("it should returns an array with two items if clause type is equal to OPTIONAL", () => {
      expect(
        clausesByType(signatureFields, [ClausesTypeEnum.OPTIONAL]).length
      ).toBe(2);
      expect(
        clausesByType(signatureFields, [ClausesTypeEnum.OPTIONAL])
      ).toStrictEqual([signatureFields[2], signatureFields[3]]);
    });
    it("it should returns an array with three items if clause type is equal to OPTIONAL and REQUIRED", () => {
      expect(
        clausesByType(signatureFields, [
          ClausesTypeEnum.OPTIONAL,
          ClausesTypeEnum.REQUIRED
        ]).length
      ).toBe(3);
      expect(
        clausesByType(signatureFields, [
          ClausesTypeEnum.OPTIONAL,
          ClausesTypeEnum.REQUIRED
        ])
      ).toStrictEqual([
        signatureFields[0],
        signatureFields[2],
        signatureFields[3]
      ]);
    });
  });

  describe("Test getAllTypes", () => {
    it("it should returns an empty array with an empty signatureFields as input", () => {
      expect(getAllTypes([])).toStrictEqual([]);
    });
    it("it should returns an array with three items", () => {
      expect(getAllTypes(signatureFields).length).toBe(3);
      expect(getAllTypes(signatureFields)).toStrictEqual([
        "REQUIRED",
        "UNFAIR",
        "OPTIONAL"
      ]);
    });
  });

  describe("Test getSectionListData", () => {
    it("it should returns an empty array with an empty signatureFields as input", () => {
      expect(getSectionListData([])).toStrictEqual([]);
    });
    it("it should returns an array with three items", () => {
      expect(getSectionListData(signatureFields).length).toBe(3);
    });
    it("it should returns an array with three items and two signature field OPTIONAL", () => {
      expect(getSectionListData(signatureFields).length).toBe(3);
      expect(getSectionListData(signatureFields)[2].data.length).toBe(2);
    });
  });

  describe("Test getClauseLabel", () => {
    it("it should returns the right text for REQUIRED type", () => {
      expect(getClauseLabel(ClausesTypeEnum.REQUIRED)).toStrictEqual(
        I18n.t("features.fci.signatureFields.required")
      );
    });
    it("it should returns the right text for OPTIONAL type", () => {
      expect(getClauseLabel(ClausesTypeEnum.OPTIONAL)).toStrictEqual(
        I18n.t("features.fci.signatureFields.optional")
      );
    });
    it("it should returns the right text for UNFAIR type", () => {
      expect(getClauseLabel(ClausesTypeEnum.UNFAIR)).toStrictEqual(
        I18n.t("features.fci.signatureFields.unfair")
      );
    });
  });

  describe("Test getRequiredSignatureFields", () => {
    it("it should returns an array of UNFAIR and REQUIRED signature fields", () => {
      expect(getRequiredSignatureFields(signatureFields)).toStrictEqual(
        requiredSignatureFields
      );
    });
  });

  describe("Test getOptionalSignatureFields", () => {
    it("it should returns an array of OPTIONAL signature fields", () => {
      expect(getOptionalSignatureFields(signatureFields)).toStrictEqual(
        optionalSignatureFields
      );
    });
  });

  describe("Test orderSignatureFields", () => {
    it("should return a sorted array when every type is present in the following order: UNFAIR, REQUIRED, OPTIONAL", () => {
      const ordered = [
        signatureFields[1], // UNFAIR
        signatureFields[0], // REQUIRED
        signatureFields[2], // OPTIONAL
        signatureFields[3] // OPTIONAL
      ];
      expect(orderSignatureFields(signatureFields)).toStrictEqual(ordered);
    });

    it("should return a sorted array when only UNFAIR and REQUIRED types are present in the following order: UNFAIR, REQUIRED", () => {
      const ordered = [
        requiredSignatureFields[1], // UNFAIR
        requiredSignatureFields[0] // REQUIRED
      ];
      expect(orderSignatureFields(requiredSignatureFields)).toStrictEqual(
        ordered
      );
    });

    it("should return a sorted array when only REQUIRED and OPTIONAL types are present in the following order: REQUIRED, OPTION", () => {
      const ordered = [
        reqAndOptSignatureFields[1], // REQUIRED
        reqAndOptSignatureFields[0] // OPTIONAL
      ];
      expect(orderSignatureFields(reqAndOptSignatureFields)).toStrictEqual(
        ordered
      );
    });

    it("should return a sorted array with unknown types in the following order: UNFAIR, REQUIRED, OPTIONAL, EVERYTHING ELSE", () => {
      const unknownField = {
        clause: {
          title: "clause title 8",
          type: "Unknown"
        },
        attrs: emptyAttrs
      };
      const ordered = [
        signatureFields[1], // UNFAIR
        signatureFields[0], // REQUIRED
        signatureFields[2], // OPTIONAL
        signatureFields[3], // OPTIONAL
        unknownField // UNKNOWN
      ];
      expect(
        orderSignatureFields([
          unknownField as SignatureField,
          ...signatureFields
        ])
      ).toStrictEqual(ordered);
    });
  });

  describe("Test getClausesCountByTypes", () => {
    it("it should return 4 if the clauses array contains REQUIRED", () => {
      expect(
        getClausesCountByTypes(mockCreateSignatureBody.documents_to_sign, [
          ClausesTypeEnum.REQUIRED
        ])
      ).toStrictEqual(4);
    });
    it("it should return 6 if the clauses array contains REQUIRED and UNFAIR", () => {
      expect(
        getClausesCountByTypes(mockCreateSignatureBody.documents_to_sign, [
          ClausesTypeEnum.REQUIRED,
          ClausesTypeEnum.UNFAIR
        ])
      ).toStrictEqual(6);
    });
    it("it should return 3 if the clauses array contains OPTIONAL", () => {
      expect(
        getClausesCountByTypes(mockCreateSignatureBody.documents_to_sign, [
          ClausesTypeEnum.OPTIONAL
        ])
      ).toStrictEqual(3);
    });
    it("it should return 7 if the clauses array contains REQUIRED and OPTIONAL", () => {
      expect(
        getClausesCountByTypes(mockCreateSignatureBody.documents_to_sign, [
          ClausesTypeEnum.OPTIONAL,
          ClausesTypeEnum.REQUIRED
        ])
      ).toStrictEqual(7);
    });
    it("it should return 2 if the clauses array contains UNFAIR", () => {
      expect(
        getClausesCountByTypes(mockCreateSignatureBody.documents_to_sign, [
          ClausesTypeEnum.UNFAIR
        ])
      ).toStrictEqual(2);
    });
  });
});
