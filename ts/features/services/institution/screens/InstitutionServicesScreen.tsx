import React, { useCallback, useEffect } from "react";
import { FlatList, ListRenderItemInfo } from "react-native";
import {
  Divider,
  IOStyles,
  IOToast,
  ListItemNav,
  VSpacer
} from "@pagopa/io-app-design-system";
import { ServiceMinified } from "../../../../../definitions/services/ServiceMinified";
import I18n from "../../../../i18n";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { useFirstRender } from "../../common/hooks/useFirstRender";
import { ServicesParamsList } from "../../common/navigation/params";
import { getLogoForInstitution } from "../../common/utils";
import { ServiceListItemSkeleton } from "../components/ServiceListItemSkeleton";
import { InstitutionServicesScreenComponent } from "../components/InstitutionServicesScreenComponent";
import { useServicesFetcher } from "../hooks/useServicesFetcher";
import { SERVICES_ROUTES } from "../../common/navigation/routes";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { ServicesHeaderSection } from "../../common/components/ServicesHeaderSection";
import { useIODispatch } from "../../../../store/hooks";
import { paginatedServicesGet } from "../store/actions";

export type InstitutionServicesScreenRouteParams = {
  institutionId: string;
  institutionName: string;
};

type InstitutionServicesScreen = IOStackNavigationRouteProps<
  ServicesParamsList,
  "INSTITUTION_SERVICES"
>;

export const InstitutionServicesScreen = ({
  navigation,
  route
}: InstitutionServicesScreen) => {
  const { institutionId, institutionName } = route.params;

  const dispatch = useIODispatch();
  const isFirstRender = useFirstRender();

  const {
    currentPage,
    data,
    fetchServices,
    isError,
    isLoading,
    isUpdating,
    refreshServices
  } = useServicesFetcher(institutionId);

  useOnFirstRender(() => fetchServices(0));

  useEffect(() => {
    if (!isFirstRender && isError) {
      IOToast.error(I18n.t("global.genericError"));
    }
  }, [isFirstRender, isError]);

  const goBack = useCallback(() => {
    dispatch(paginatedServicesGet.cancel());
    navigation.goBack();
  }, [dispatch, navigation]);

  const navigateToServiceDetails = useCallback(
    (service: ServiceMinified) =>
      navigation.navigate(SERVICES_ROUTES.SERVICES_NAVIGATOR, {
        screen: SERVICES_ROUTES.SERVICE_DETAIL,
        params: {
          serviceId: service.id as ServiceId
        }
      }),
    [navigation]
  );

  const handleEndReached = useCallback(
    () => fetchServices(currentPage + 1),
    [currentPage, fetchServices]
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ServiceMinified>) => (
      <ListItemNav
        value={item.name}
        onPress={() => navigateToServiceDetails(item)}
        accessibilityLabel={item.name}
      />
    ),
    [navigateToServiceDetails]
  );

  const renderListFooterComponent = useCallback(() => {
    if (isUpdating && currentPage > 0) {
      return (
        <>
          <ServiceListItemSkeleton />
          <Divider />
          <ServiceListItemSkeleton />
          <Divider />
          <ServiceListItemSkeleton />
        </>
      );
    }
    return <VSpacer size={16} />;
  }, [currentPage, isUpdating]);

  if (isFirstRender || isLoading) {
    return (
      <InstitutionServicesScreenComponent
        goBack={goBack}
        refreshing={isUpdating}
      >
        <ServicesHeaderSection isLoading={true} />
        <VSpacer size={16} />
        <FlatList
          ItemSeparatorComponent={() => <Divider />}
          contentContainerStyle={IOStyles.horizontalContentPadding}
          data={Array.from({ length: 5 })}
          keyExtractor={(_, index) => `service-placeholder-${index}`}
          renderItem={() => <ServiceListItemSkeleton />}
          scrollEnabled={false}
          testID="intitution-services-list-skeleton"
        />
      </InstitutionServicesScreenComponent>
    );
  }

  return (
    <InstitutionServicesScreenComponent
      goBack={goBack}
      title={institutionName}
      refreshing={isUpdating}
      onRefresh={refreshServices}
    >
      <ServicesHeaderSection
        logoUri={getLogoForInstitution(institutionId)}
        title={institutionName}
        subTitle={I18n.t("services.institution.header.subtitle", {
          count: data?.count ?? 0
        })}
      />
      <VSpacer size={16} />
      <FlatList
        ItemSeparatorComponent={() => <Divider />}
        ListFooterComponent={renderListFooterComponent}
        contentContainerStyle={IOStyles.horizontalContentPadding}
        data={data?.services || []}
        keyExtractor={(item, index) => `service-${item.id}-${index}`}
        renderItem={renderItem}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.001}
        scrollEnabled={false}
        testID="intitution-services-list"
      />
    </InstitutionServicesScreenComponent>
  );
};
