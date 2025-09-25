import { useCallback, useMemo } from "react";
import { ListItemHeader } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { View } from "react-native";
import { FeaturedService } from "../../../../../definitions/services/FeaturedService";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import * as analytics from "../../common/analytics";
import { SERVICES_ROUTES } from "../../common/navigation/routes";
import { featuredServicesGet } from "../store/actions";
import {
  featuredServicesSelector,
  isErrorFeaturedServicesSelector,
  isLoadingFeaturedServicesSelector
} from "../store/selectors";
import {
  FeaturedServicesCarousel,
  FeaturedServicesCarouselSkeleton
} from "./FeaturedServicesCarousel";

export const FeaturedServiceList = () => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

  const featuredServices = useIOSelector(featuredServicesSelector);
  const isError = useIOSelector(isErrorFeaturedServicesSelector);
  const isLoading = useIOSelector(isLoadingFeaturedServicesSelector);

  useOnFirstRender(() => dispatch(featuredServicesGet.request()));

  const handlePress = useCallback(
    ({ id, name, organization_name }: FeaturedService) => {
      analytics.trackServiceSelected({
        organization_name: organization_name ?? "",
        service_id: id,
        service_name: name,
        source: "featured_services"
      });

      navigation.navigate(SERVICES_ROUTES.SERVICES_NAVIGATOR, {
        screen: SERVICES_ROUTES.SERVICE_DETAIL,
        params: {
          serviceId: id
        }
      });
    },
    [navigation]
  );

  const mappedFeaturedServices = useMemo(
    () =>
      featuredServices.map(({ organization_name, ...rest }) => ({
        ...rest,
        organizationName: organization_name,
        onPress: () => handlePress({ organization_name, ...rest })
      })),
    [featuredServices, handlePress]
  );

  const isVisible = useMemo(
    () => isLoading || mappedFeaturedServices.length > 0,
    [isLoading, mappedFeaturedServices]
  );

  if (isError || !isVisible) {
    return null;
  }

  return (
    <View>
      <ListItemHeader
        accessibilityLabel={I18n.t(
          "services.home.featured.services.a11y.title"
        )}
        label={I18n.t("services.home.featured.services.title")}
      />
      {isLoading ? (
        <FeaturedServicesCarouselSkeleton />
      ) : (
        <FeaturedServicesCarousel services={mappedFeaturedServices} />
      )}
    </View>
  );
};
