import React, { useCallback, useMemo } from "react";
import { ListItemHeader, VSpacer } from "@pagopa/io-app-design-system";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { SERVICES_ROUTES } from "../../common/navigation/routes";
import { featuredServicesGet } from "../store/actions";
import {
  featuredServicesSelector,
  isErrorFeaturedServicesSelector,
  isLoadingFeaturedServicesSelector
} from "../store/reducers";
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
    (serviceId: string) => {
      navigation.navigate(SERVICES_ROUTES.SERVICES_NAVIGATOR, {
        screen: SERVICES_ROUTES.SERVICE_DETAIL,
        params: {
          serviceId: serviceId as NonEmptyString
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
        onPress: () => handlePress(rest.id)
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
    <>
      <ListItemHeader label={I18n.t("services.home.featured.services.title")} />
      {isLoading ? (
        <FeaturedServicesCarouselSkeleton />
      ) : (
        <FeaturedServicesCarousel services={mappedFeaturedServices} />
      )}
      <VSpacer size={24} />
    </>
  );
};
