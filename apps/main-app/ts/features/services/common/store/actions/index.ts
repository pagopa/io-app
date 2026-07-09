import { ServiceDetailsActions } from "../../../details/store/actions/details";
import { ServicePreferenceActions } from "../../../details/store/actions/preference";
import { FavouriteServicesActions } from "../../../favouriteServices/store/actions";
import { FseDiscoveryBannerActions } from "../../../fseDiscoveryBanner/store/actions";
import { ServicesHomeActions } from "../../../home/store/actions";
import { InstitutionServicesActions } from "../../../institution/store/actions";
import { SearchActions } from "../../../search/store/actions";

export type ServicesActions =
  | FavouriteServicesActions
  | FseDiscoveryBannerActions
  | InstitutionServicesActions
  | SearchActions
  | ServiceDetailsActions
  | ServicePreferenceActions
  | ServicesHomeActions;
