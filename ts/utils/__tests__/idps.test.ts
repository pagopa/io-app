import { fromGeneratedToLocalSpidIdp } from "../idps";
import { SpidIdp as GeneratedSpidIdpType } from "../../../definitions/content/SpidIdp";

describe("IDPS utils", () => {
  describe("fromGeneratedToLocalSpidIdp", () => {
    it("should correctly transform GeneratedSpidIdpType to SpidIdp", () => {
      const mockGeneratedIdps: ReadonlyArray<GeneratedSpidIdpType> = [
        {
          id: "test-id-1",
          name: "Test IDP 1",
          logo: "https://example.com/logo1.png",
          logoDark: "https://example.com/logo1-dark.png",
          profileUrl: "https://example.com/profile1"
        },
        {
          id: "test-id-2",
          name: "Test IDP 2",
          logo: "https://example.com/logo2.png",
          logoDark: "https://example.com/logo2-dark.png",
          profileUrl: "https://example.com/profile2",
          isTestIdp: false
        },
        {
          id: "test-id-3",
          name: "Test IDP 3",
          logo: "https://example.com/logo3.png",
          logoDark: "https://example.com/logo3-dark.png",
          profileUrl: "https://example.com/profile3",
          isTestIdp: true
        }
      ];

      const result = fromGeneratedToLocalSpidIdp(mockGeneratedIdps);

      expect(result).toHaveLength(3);

      expect(result[0].id).toBe("test-id-1");
      expect(result[0].name).toBe("Test IDP 1");
      expect(result[0].logo.light).toEqual({
        uri: "https://example.com/logo1.png"
      });
      expect(result[0].logo.dark).toEqual({
        uri: "https://example.com/logo1-dark.png"
      });
      expect(result[0].profileUrl).toBe("https://example.com/profile1");
      expect(result[0].isTestIdp).toBeUndefined();

      expect(result[1].id).toBe("test-id-2");
      expect(result[1].name).toBe("Test IDP 2");
      expect(result[1].logo.light).toEqual({
        uri: "https://example.com/logo2.png"
      });
      expect(result[1].logo.dark).toEqual({
        uri: "https://example.com/logo2-dark.png"
      });
      expect(result[1].profileUrl).toBe("https://example.com/profile2");
      expect(result[1].isTestIdp).toBe(false);

      expect(result[2].id).toBe("test-id-3");
      expect(result[2].name).toBe("Test IDP 3");
      expect(result[2].logo.light).toEqual({
        uri: "https://example.com/logo3.png"
      });
      expect(result[2].logo.dark).toEqual({
        uri: "https://example.com/logo3-dark.png"
      });
      expect(result[2].profileUrl).toBe("https://example.com/profile3");
      expect(result[2].isTestIdp).toBe(true);
    });

    it("should handle empty array input", () => {
      const emptyIdps: ReadonlyArray<GeneratedSpidIdpType> = [];

      const result = fromGeneratedToLocalSpidIdp(emptyIdps);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it("should handle missing logoDark property", () => {
      const mockGeneratedIdps: ReadonlyArray<GeneratedSpidIdpType> = [
        {
          id: "test-id-3",
          name: "Test IDP 3",
          logo: "https://example.com/logo3.png",
          profileUrl: "https://example.com/profile3"
        } as GeneratedSpidIdpType
      ];

      const result = fromGeneratedToLocalSpidIdp(mockGeneratedIdps);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("test-id-3");
      expect(result[0].name).toBe("Test IDP 3");
      expect(result[0].logo.light).toEqual({
        uri: "https://example.com/logo3.png"
      });
      expect(result[0].logo.dark).toEqual(undefined);
      expect(result[0].profileUrl).toBe("https://example.com/profile3");
    });
  });
});
