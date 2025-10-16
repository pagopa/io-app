import { createAsyncAction } from "typesafe-actions";
import { NetworkError } from "../../../../utils/errors.ts";
import { ToyProfileResponse } from "../../types";

export const getToyProfileDetailsAction = createAsyncAction(
  "TOY_PROFILE_DETAILS_REQUEST",
  "TOY_PROFILE_DETAILS_SUCCESS",
  "TOY_PROFILE_DETAILS_FAILURE",
  "TOY_PROFILE_DETAILS_CANCEL"
)<void, ToyProfileResponse, NetworkError, void>();
