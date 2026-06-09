import I18n from "i18next";
import {
  getCredentialNameFromType,
  isItwCredential
} from "../itwCredentialUtils";
import { CredentialType } from "../itwMocksUtils";
import { CredentialMetadata } from "../itwTypesUtils";

describe("getCredentialNameFromType", () => {
  describe("with valid credential types", () => {
    const scenarios: ReadonlyArray<{
      type: string;
      isItwCredential: boolean;
      expectedTranslation: string;
    }> = [
      {
        type: CredentialType.PID,
        isItwCredential: true,
        expectedTranslation: I18n.t("features.itWallet.credentialName.pid")
      },
      {
        type: CredentialType.EUROPEAN_DISABILITY_CARD,
        isItwCredential: false,
        expectedTranslation: I18n.t("features.itWallet.credentialName.dc")
      },
      {
        type: CredentialType.AGE_VERIFICATION,
        isItwCredential: false,
        expectedTranslation: I18n.t("features.itWallet.credentialName.av")
      },
      {
        type: CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD,
        isItwCredential: false,
        expectedTranslation: I18n.t("features.itWallet.credentialName.ts")
      },
      {
        type: CredentialType.DRIVING_LICENSE,
        isItwCredential: false,
        expectedTranslation: I18n.t("features.itWallet.credentialName.mdl")
      },
      {
        type: CredentialType.PID,
        isItwCredential: true,
        expectedTranslation: I18n.t("features.itWallet.credentialName.pid")
      },
      {
        type: CredentialType.PID,
        isItwCredential: false,
        expectedTranslation: I18n.t("features.itWallet.credentialName.eid")
      },
      {
        type: CredentialType.EDUCATION_DEGREE,
        isItwCredential: false,
        expectedTranslation: I18n.t("features.itWallet.credentialName.ed")
      },
      {
        type: CredentialType.EDUCATION_ENROLLMENT,
        isItwCredential: false,
        expectedTranslation: I18n.t("features.itWallet.credentialName.ee")
      },
      {
        type: CredentialType.RESIDENCY,
        isItwCredential: false,
        expectedTranslation: I18n.t("features.itWallet.credentialName.res")
      },
      {
        type: CredentialType.EDUCATION_DIPLOMA,
        isItwCredential: false,
        expectedTranslation: I18n.t("features.itWallet.credentialName.edip")
      },
      {
        type: CredentialType.EDUCATION_ATTENDANCE,
        isItwCredential: false,
        expectedTranslation: I18n.t("features.itWallet.credentialName.edat")
      }
    ];

    test.each(scenarios)(
      "should return the i18n translation for $type (isItwCredential: $isItwCredential)",
      ({ type, isItwCredential, expectedTranslation }) => {
        const result = getCredentialNameFromType(type, isItwCredential);
        expect(result).toBe(expectedTranslation);
      }
    );
  });

  describe("with PID credential type", () => {
    it("should return PID translation when isItwCredential is true", () => {
      const result = getCredentialNameFromType(CredentialType.PID, true);
      expect(result).toBe(I18n.t("features.itWallet.credentialName.pid"));
    });

    it("should return EID translation when isItwCredential is false", () => {
      const result = getCredentialNameFromType(CredentialType.PID, false);
      expect(result).toBe(I18n.t("features.itWallet.credentialName.eid"));
    });

    it("should return EID translation by default when isItwCredential is not provided", () => {
      const result = getCredentialNameFromType(CredentialType.PID);
      expect(result).toBe(I18n.t("features.itWallet.credentialName.eid"));
    });
  });

  describe("with undefined type", () => {
    it("should return empty string when type is undefined", () => {
      const result = getCredentialNameFromType(undefined);
      expect(result).toBe("");
    });

    it("should return empty string when type is undefined and isItwCredential is true", () => {
      const result = getCredentialNameFromType(undefined, true);
      expect(result).toBe("");
    });
  });

  describe("with unknown credential type", () => {
    it("should return the unknown type string when it is not mapped", () => {
      const unknownType = "UnknownCredentialType";
      const result = getCredentialNameFromType(unknownType);
      expect(result).toBe(unknownType);
    });

    it("should return the unknown type string even when isItwCredential is true", () => {
      const unknownType = "SomeNewCredentialType";
      const result = getCredentialNameFromType(unknownType, true);
      expect(result).toBe(unknownType);
    });
  });

  describe("edge cases", () => {
    it("should return empty string when type is an empty string", () => {
      const result = getCredentialNameFromType("");
      expect(result).toBe("");
    });

    it("should handle null type gracefully", () => {
      // @ts-expect-error testing null value explicitly
      const result = getCredentialNameFromType(null);
      expect(result).toBe("");
    });
  });
});

describe("isItwCredential", () => {
  test.each<[Partial<CredentialMetadata>, boolean]>([
    [
      {
        spec_version: "1.0.0",
        verification: {
          assurance_level: "substantial",
          trust_framework: "it_spid"
        }
      },
      false
    ],
    [
      {
        spec_version: "1.0.0",
        verification: {
          assurance_level: "substantial",
          trust_framework: "it_l2+document_proof"
        }
      },
      false
    ],
    [
      {
        spec_version: "1.0.0",
        verification: { assurance_level: "high", trust_framework: "it_cie" }
      },
      false
    ],
    [
      {
        spec_version: "1.3.3",
        verification: { assurance_level: "high", trust_framework: "it_cie" }
      },
      true
    ],
    [
      {
        spec_version: "1.3.3",
        verification: {
          assurance_level: "substantial",
          trust_framework: "it_l2+document_proof"
        }
      },
      true
    ]
  ])("when %j should return %p", (credentialMetadata, expected) => {
    expect(isItwCredential(credentialMetadata as CredentialMetadata)).toEqual(
      expected
    );
  });
});
