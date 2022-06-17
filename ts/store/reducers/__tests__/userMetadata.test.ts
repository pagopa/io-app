import * as E from "fp-ts/lib/Either";
import * as pot from "@pagopa/ts-commons/lib/pot";

import { UserMetadata as BackendUserMetadata } from "../../../../definitions/backend/UserMetadata";
import {
  userMetadataLoad,
  userMetadataUpsert
} from "../../actions/userMetadata";
import userMetadataReducer, {
  backendUserMetadataToUserMetadata,
  UserMetadata,
  UserMetadataMetadata,
  UserMetadataState,
  userMetadataToBackendUserMetadata
} from "../userMetadata";

describe("userMetadata", () => {
  describe("backendUserMetadataToUserMetadata", () => {
    it("should covert a valid backendUserMetadata without errors", () => {
      const metadata: UserMetadataMetadata = {
        experimentalFeatures: true,
        organizationsOfInterest: []
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
        E.right(userMetadata)
      );
    });

    it("should return an Error if the decode of the backendUserMetadata experimentalFeatures fails", () => {
      const backendUserMetadataBadExperimentalFeatures: BackendUserMetadata = {
        version: 1,
        metadata: JSON.stringify({
          experimentalFeatures: "NOT_A_BOOLEAN",
          organizationsOfInterest: ["a", "b"]
        })
      };
      expect(
        backendUserMetadataToUserMetadata(
          backendUserMetadataBadExperimentalFeatures
        )
      ).toEqual(E.left(new Error()));
    });

    it("should return an Error if the decode of the backendUserMetadata organizationsOfInterest fails", () => {
      const backendUserMetadataBadOrganization: BackendUserMetadata = {
        version: 1,
        metadata: JSON.stringify({
          experimentalFeatures: true,
          organizationsOfInterest: [1, 2, 3]
        })
      };
      expect(
        backendUserMetadataToUserMetadata(backendUserMetadataBadOrganization)
      ).toEqual(E.left(new Error()));
    });
  });

  describe("userMetadataToBackendUserMetadata", () => {
    it("should covert a userMetadata correctly ", () => {
      const metadata: UserMetadataMetadata = {
        experimentalFeatures: true,
        organizationsOfInterest: []
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

  describe("reducer", () => {
    const userMetadata: UserMetadata = {
      version: 1,
      metadata: {
        experimentalFeatures: false,
        organizationsOfInterest: []
      }
    };

    it("should handle userMetadataLoad correctly", () => {
      const initialState: UserMetadataState = pot.none;

      const loadingState = userMetadataReducer(
        initialState,
        userMetadataLoad.request()
      );
      expect(loadingState).toEqual(pot.noneLoading);

      const failureState = userMetadataReducer(
        loadingState,
        userMetadataLoad.failure(new Error())
      );
      expect(failureState).toEqual(pot.noneError(new Error()));

      const successState = userMetadataReducer(
        loadingState,
        userMetadataLoad.success(userMetadata)
      );
      expect(successState).toEqual(pot.some(userMetadata));
    });

    it("should handle userMetadataUpsert correctly", () => {
      const initialState: UserMetadataState = pot.some(userMetadata);
      const currentVersion: number = userMetadata.version;
      const newUserMetadata: UserMetadata = {
        version: currentVersion + 1,
        metadata: {
          experimentalFeatures: true
        }
      };

      const updatingState = userMetadataReducer(
        initialState,
        userMetadataUpsert.request(newUserMetadata)
      );
      expect(updatingState).toEqual(
        pot.someUpdating(userMetadata, newUserMetadata)
      );

      const failureState = userMetadataReducer(
        updatingState,
        userMetadataUpsert.failure(new Error())
      );
      expect(failureState).toEqual(pot.someError(userMetadata, new Error()));
    });
  });
});
