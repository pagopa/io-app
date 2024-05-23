import React, { useCallback, useMemo } from "react";
import { ListItemHeader, VSpacer } from "@pagopa/io-app-design-system";
import { Institution } from "../../../../../definitions/services/Institution";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { SERVICES_ROUTES } from "../../common/navigation/routes";
import { featuredInstitutionsGet } from "../store/actions";
import {
  featuredInstitutionsSelector,
  isErrorFeaturedInstitutionsSelector,
  isLoadingFeaturedInstitutionsSelector
} from "../store/reducers";
import {
  FeaturedInstitutionsCarousel,
  FeaturedInstitutionsCarouselSkeleton
} from "./FeaturedInstitutionsCarousel";

export const FeaturedInstitutionList = () => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

  const featuredInstitutions = useIOSelector(featuredInstitutionsSelector);
  const isError = useIOSelector(isErrorFeaturedInstitutionsSelector);
  const isLoading = useIOSelector(isLoadingFeaturedInstitutionsSelector);

  useOnFirstRender(() => dispatch(featuredInstitutionsGet.request()));

  const handlePress = useCallback(
    ({ fiscal_code, name }: Institution) => {
      navigation.navigate(SERVICES_ROUTES.SERVICES_NAVIGATOR, {
        screen: SERVICES_ROUTES.INSTITUTION_SERVICES,
        params: {
          institutionId: fiscal_code,
          institutionName: name
        }
      });
    },
    [navigation]
  );

  const mappedFeaturedInstitutions = useMemo(
    () =>
      featuredInstitutions.map(props => ({
        ...props,
        onPress: () => handlePress(props)
      })),
    [featuredInstitutions, handlePress]
  );

  const isVisible = useMemo(
    () => isLoading || mappedFeaturedInstitutions.length > 0,
    [isLoading, mappedFeaturedInstitutions]
  );

  if (isError || !isVisible) {
    return null;
  }

  return (
    <>
      <ListItemHeader
        label={I18n.t("services.home.featured.institutions.title")}
      />
      {isLoading ? (
        <FeaturedInstitutionsCarouselSkeleton />
      ) : (
        <FeaturedInstitutionsCarousel
          institutions={mappedFeaturedInstitutions}
        />
      )}
      <VSpacer size={24} />
    </>
  );
};
