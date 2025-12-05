import { ServiceDetailsScreenRouteParams } from "../../details/screens/ServiceDetailsScreen";
import { ServiceFavouritesScreenRouteParams } from "../../favourites/screens/ServiceFavouritesScreen";
import { InstitutionServicesScreenRouteParams } from "../../institution/screens/InstitutionServicesScreen";
import { SERVICES_ROUTES } from "./routes";

export type ServicesParamsList = {
  [SERVICES_ROUTES.SERVICE_DETAIL]: ServiceDetailsScreenRouteParams;
  [SERVICES_ROUTES.INSTITUTION_SERVICES]: InstitutionServicesScreenRouteParams;
  [SERVICES_ROUTES.SERVICE_FAVOURITES]: ServiceFavouritesScreenRouteParams;
};
