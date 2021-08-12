import { Either, left, right } from "fp-ts/lib/Either";
import * as t from "io-ts";
import * as pot from "italia-ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { UserMetadata as BackendUserMetadata } from "../../../definitions/backend/UserMetadata";
import { Action } from "../actions/types";
import { userMetadataLoad, userMetadataUpsert } from "../actions/userMetadata";
import { GlobalState } from "./types";

export const UserMetadataMetadata = t.partial({
  experimentalFeatures: t.boolean,
  organizationsOfInterest: t.readonlyArray(t.string)
});

export type UserMetadataMetadata = t.TypeOf<typeof UserMetadataMetadata>;

export type UserMetadata = {
  version: BackendUserMetadata["version"];
  metadata: UserMetadataMetadata;
};

export const emptyUserMetadata: BackendUserMetadata = {
  version: 0,
  metadata: ""
};

export type UserMetadataState = pot.Pot<UserMetadata, Error>;

export function backendUserMetadataToUserMetadata(
  backendUserMetadata: BackendUserMetadata
): Either<Error, UserMetadata> {
  if (backendUserMetadata.metadata === "") {
    return right({
      version: backendUserMetadata.version,
      metadata: {}
    });
  }

  try {
    const backendUserMetadataMetadataParsed = JSON.parse(
      backendUserMetadata.metadata
    );

    const metadataOrError = UserMetadataMetadata.decode(
      backendUserMetadataMetadataParsed
    );

    if (metadataOrError.isLeft()) {
      // TODO: Add proper error (https://www.pivotaltracker.com/story/show/170819415)
      return left(new Error());
    }

    return right({
      version: backendUserMetadata.version,
      metadata: metadataOrError.value
    });
  } catch (e) {
    return left(e);
  }
}

export function userMetadataToBackendUserMetadata(
  appUserMetadata: UserMetadata
): BackendUserMetadata {
  return {
    version: appUserMetadata.version,
    metadata: JSON.stringify(appUserMetadata.metadata)
  };
}

export const INITIAL_STATE: UserMetadataState = pot.none;

// Selectors
export const userMetadataSelector = (state: GlobalState): UserMetadataState =>
  state.userMetadata;

const userMetadataReducer = (
  state: UserMetadataState = INITIAL_STATE,
  action: Action
): UserMetadataState => {
  switch (action.type) {
    // Load
    case getType(userMetadataLoad.request):
      return pot.toLoading(state);

    case getType(userMetadataLoad.failure):
      return pot.toError(state, action.payload);

    case getType(userMetadataLoad.success):
      return pot.some(action.payload);

    // Upsert
    case getType(userMetadataUpsert.request):
      return pot.toUpdating(state, action.payload);

    case getType(userMetadataUpsert.failure):
      return pot.toError(state, action.payload);

    case getType(userMetadataUpsert.success):
      return pot.some(action.payload);

    default:
      return state;
  }
};

export default userMetadataReducer;
