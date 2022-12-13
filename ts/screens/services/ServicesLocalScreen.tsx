import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { useCallback } from "react";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import LocalServicesWebView from "../../components/services/LocalServicesWebView";
import ROUTES from "../../navigation/routes";
import { showServiceDetails } from "../../store/actions/services";
import { useIODispatch } from "../../store/hooks";

const ServicesLocalScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useNavigation();

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

  return <LocalServicesWebView onServiceSelect={onServiceSelect} />;
};

export default ServicesLocalScreen;
