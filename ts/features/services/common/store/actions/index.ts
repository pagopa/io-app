import { ServicesHomeActions } from "../../../home/store/actions";
import { ServiceDetailsActions } from "../../../details/store/actions/details";
import { ServicePreferenceActions } from "../../../details/store/actions/preference";
import { InstitutionServicesActions } from "../../../institution/store/actions";
import { SearchActions } from "../../../search/store/actions";
import { FavouriteServiceActions } from "../../../details/store/actions/favourite";

export type ServicesActions =
  | InstitutionServicesActions
  | SearchActions
  | ServicesHomeActions
  | ServiceDetailsActions
  | ServicePreferenceActions
  | FavouriteServiceActions;
