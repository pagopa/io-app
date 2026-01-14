import { put, select } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { loadServiceDetail } from "../../details/store/actions/details";
import { favouriteServiceByIdSelector } from "../store/selectors";
import { addFavouriteServiceSuccess } from "../store/actions";

/**
 * saga to align the stored favourite service data with the newly loaded details.
 * if the service just loaded is found in the user's favourites list,
 * this saga updates its local information to ensure consistency.
 * @param action
 */
export function* handleSyncFavouriteService(
  action: ActionType<typeof loadServiceDetail.success>
) {
  const { id, organization, name } = action.payload;

  const currentFavourite = yield* select(favouriteServiceByIdSelector, id);

  if (!currentFavourite) {
    return;
  }

  const hasDataChanged =
    currentFavourite.name !== name ||
    currentFavourite.institution.name !== organization.name;

  if (hasDataChanged) {
    yield* put(
      addFavouriteServiceSuccess({
        ...currentFavourite,
        institution: organization,
        name
      })
    );
  }
}
