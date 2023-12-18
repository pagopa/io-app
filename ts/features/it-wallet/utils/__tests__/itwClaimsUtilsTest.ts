import * as E from "fp-ts/lib/Either";
import {
  DateClaim,
  EvidenceClaim,
  ImageClaim,
  PlaceOfBirthClaim
} from "../itwClaimsUtils";

describe("Test itwClaimsUtils", () => {
  describe("Test DateClaim", () => {
    it("should match a string in format YYYY-MM-DD", () => {
      const date = "2020-01-01";
      expect(E.isRight(DateClaim.decode(date))).toEqual(true);
    });

    it("should not match a string with only numbers", () => {
      const date = "0000001";
      expect(E.isRight(DateClaim.decode(date))).toEqual(false);
    });
  });

  describe("Test ImageClaim", () => {
    it("should match a string starting with data:image/png;base64,", () => {
      const image = "data:image/png;base64,testtesttest";
      expect(E.isRight(ImageClaim.decode(image))).toEqual(true);
    });

    it("should not match a string not starting with data:image/png;base64,", () => {
      const image = "testtesttest";
      expect(E.isRight(ImageClaim.decode(image))).toEqual(false);
    });
  });

  describe("Test EvidenceClaim", () => {
    it("should match a valid evidence claim", () => {
      const evidence = [
        {
          type: "test",
          record: {
            type: "test",
            source: {
              organization_name: "test",
              organization_id: "test",
              country_code: "test"
            }
          }
        }
      ];
      expect(E.isRight(EvidenceClaim.decode(evidence))).toEqual(true);
    });

    it("should not match an invalid evidence claim", () => {
      const evidence = [
        {
          type: "test",
          record: {
            type: "test",
            source: {
              organization_name: "test",
              organization_id: "test"
            }
          }
        }
      ];
      expect(E.isRight(EvidenceClaim.decode(evidence))).toEqual(false);
    });

    it("should match a valid evidence claim with multiple records", () => {
      const evidence = [
        {
          type: "test",
          record: {
            type: "test",
            source: {
              organization_name: "test",
              organization_id: "test",
              country_code: "test"
            }
          }
        },
        {
          type: "test",
          record: {
            type: "test",
            source: {
              organization_name: "test",
              organization_id: "test",
              country_code: "test"
            }
          }
        }
      ];
      expect(E.isRight(EvidenceClaim.decode(evidence))).toEqual(true);
    });
  });

  describe("Test PlaceOfBirthClaim", () => {
    it("should match a valid place of birth claim", () => {
      const placeOfBirth = {
        country: "test",
        locality: "test"
      };
      expect(E.isRight(PlaceOfBirthClaim.decode(placeOfBirth))).toEqual(true);
    });

    it("should not match an invalid place of birth claim", () => {
      const placeOfBirth = {
        country: "test"
      };
      expect(E.isRight(PlaceOfBirthClaim.decode(placeOfBirth))).toEqual(false);
    });
  });
});
