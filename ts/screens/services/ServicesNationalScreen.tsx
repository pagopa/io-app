import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { useCallback } from "react";
import { Animated } from "react-native";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import ServicesTab from "../../components/services/ServicesTab";
import ROUTES from "../../navigation/routes";
import {
  loadVisibleServices,
  showServiceDetails
} from "../../store/actions/services";
import { userMetadataLoad } from "../../store/actions/userMetadata";
import { useIODispatch, useIOSelector } from "../../store/hooks";
import {
  nationalServicesSectionsSelector,
  visibleServicesDetailLoadStateSelector
} from "../../store/reducers/entities/services";
import { userMetadataSelector } from "../../store/reducers/userMetadata";

const tabScrollOffset = new Animated.Value(0);

const ServicesNationalScreen = () => {
  const navigation = useNavigation();
  const dispatch = useIODispatch();
  const nationalTabSections = useIOSelector(nationalServicesSectionsSelector);
  const visibleServicesContentLoadState = useIOSelector(
    visibleServicesDetailLoadStateSelector
  );
  const potUserMetadata = useIOSelector(userMetadataSelector);
  const isLoadingServices = pot.isLoading(visibleServicesContentLoadState);

  const isRefreshing =
    isLoadingServices ||
    pot.isLoading(potUserMetadata) ||
    pot.isUpdating(potUserMetadata);

  const refreshContent = useCallback(() => {
    dispatch(userMetadataLoad.request());
    dispatch(loadVisibleServices.request());
  }, [dispatch]);

  const onServiceSelect = useCallback(
    (service: ServicePublic) => {
      // when a service gets selected the service is recorded as read
      dispatch(showServiceDetails(service));
      navigation.navigate(ROUTES.SERVICES_NAVIGATOR, {
        screen: ROUTES.SERVICE_DETAIL,
        params: { serviceId: service.service_id }
      });
    },
    [dispatch, navigation]
  );

  return (
    <ServicesTab
      sections={nationalTabSections}
      isRefreshing={isRefreshing}
      onRefresh={refreshContent}
      onServiceSelect={onServiceSelect}
      tabScrollOffset={tabScrollOffset}
    />
  );
};

export default ServicesNationalScreen;
