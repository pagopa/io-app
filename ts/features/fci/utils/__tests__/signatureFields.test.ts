import { TypeEnum as ClausesTypeEnum } from "../../../../../definitions/fci/Clause";
import { SignatureField } from "../../../../../definitions/fci/SignatureField";
import {
  clausesByType,
  getAllTypes,
  getSectionListData
} from "../signatureFields";

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
});
