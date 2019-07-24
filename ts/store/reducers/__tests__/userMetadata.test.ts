import { left, right } from "fp-ts/lib/Either";

import { UserMetadata as BackendUserMetadata } from "../../../../definitions/backend/UserMetadata";
import {
  backendUserMetadataToUserMetadata,
  UserMetadata,
  UserMetadataMetadata,
  userMetadataToBackendUserMetadata
} from "../userMetadata";

describe("userMetadata", () => {
  describe("backendUserMetadataToUserMetadata", () => {
    it("should covert a valid backendUserMetadata without errors", () => {
      const metadata: UserMetadataMetadata = {
        experimentalFeatures: true
      };
      const backendUserMetadata: BackendUserMetadata = {
        version: 1,
        metadata: JSON.stringify(metadata)
      };
      const userMetadata: UserMetadata = {
        version: 1,
        metadata
      };
      expect(backendUserMetadataToUserMetadata(backendUserMetadata)).toEqual(
        right(userMetadata)
      );
    });

    it("should return an Error if the decode of the backendUserMetadata fails", () => {
      const backendUserMetadata: BackendUserMetadata = {
        version: 1,
        metadata: JSON.stringify({
          experimentalFeatures: "NOT_A_BOOLEAN"
        })
      };
      expect(backendUserMetadataToUserMetadata(backendUserMetadata)).toEqual(
        left(new Error())
      );
    });
  });

  describe("userMetadataToBackendUserMetadata", () => {
    it("should covert a userMetadata correctly ", () => {
      const metadata: UserMetadataMetadata = {
        experimentalFeatures: true
      };
      const userMetadata: UserMetadata = {
        version: 1,
        metadata
      };
      const backendUserMetadata: BackendUserMetadata = {
        version: 1,
        metadata: JSON.stringify(metadata)
      };

      expect(userMetadataToBackendUserMetadata(userMetadata)).toEqual(
        backendUserMetadata
      );
    });
  });
});
