import { useCallback, useMemo } from "react";
import { BannerErrorState, ListItemHeader } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { View } from "react-native";
import { Institution } from "../../../../../definitions/services/Institution";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import * as analytics from "../../common/analytics";
import { SERVICES_ROUTES } from "../../common/navigation/routes";
import { featuredInstitutionsGet } from "../store/actions";
import {
  featuredInstitutionsSelector,
  isErrorFeaturedInstitutionsSelector,
  isLoadingFeaturedInstitutionsSelector,
  shouldRenderFeaturedInstitutionListSelector
} from "../store/selectors";
import {
  FeaturedInstitutionsCarousel,
  FeaturedInstitutionsCarouselSkeleton
} from "./FeaturedInstitutionsCarousel";

export const FeaturedInstitutionList = () => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

  const institutions = useIOSelector(featuredInstitutionsSelector);
  const isError = useIOSelector(isErrorFeaturedInstitutionsSelector);
  const isLoading = useIOSelector(isLoadingFeaturedInstitutionsSelector);
  const shouldRender = useIOSelector(
    shouldRenderFeaturedInstitutionListSelector
  );

  const fetchFeaturedInstitutions = useCallback(
    () => dispatch(featuredInstitutionsGet.request()),
    [dispatch]
  );

  useOnFirstRender(fetchFeaturedInstitutions);

  const handlePress = useCallback(
    ({ fiscal_code, name }: Institution) => {
      analytics.trackInstitutionSelected({
        organization_fiscal_code: fiscal_code,
        organization_name: name,
        source: "featured_organizations"
      });

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

  const mappedInstitutions = useMemo(
    () =>
      institutions.map(props => ({
        ...props,
        onPress: () => handlePress(props)
      })),
    [institutions, handlePress]
  );

  if (!shouldRender) {
    return null;
  }

  const Content = () => {
    if (isLoading && institutions.length === 0) {
      return (
        <FeaturedInstitutionsCarouselSkeleton testID="featured-institution-list-skeleton" />
      );
    }

    if (isError) {
      return (
        <BannerErrorState
          label={I18n.t(
            "services.home.featured.institutions.error.banner.label"
          )}
          actionText={I18n.t(
            "services.home.featured.institutions.error.banner.cta"
          )}
          onPress={fetchFeaturedInstitutions}
          testID="featured-institution-list-error"
        />
      );
    }

    return (
      <FeaturedInstitutionsCarousel
        institutions={mappedInstitutions}
        testID="featured-institution-list"
      />
    );
  };

  return (
    <View>
      <ListItemHeader
        label={I18n.t("services.home.featured.institutions.title")}
      />
      <Content />
    </View>
  );
};
