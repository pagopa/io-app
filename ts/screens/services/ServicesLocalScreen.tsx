import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { useCallback } from "react";
import { Platform, View, StyleSheet } from "react-native";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import LocalServicesWebView from "../../components/services/LocalServicesWebView";
import ROUTES from "../../navigation/routes";
import { showServiceDetails } from "../../store/actions/services";
import { useIODispatch } from "../../store/hooks";

const styles = StyleSheet.create({
  contentWrapper: {
    flex: 1,
    borderTopWidth: Platform.OS === "android" ? 0.19 : undefined,
    elevation: 0.1
  }
});

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

  return (
    <View style={styles.contentWrapper}>
      <LocalServicesWebView onServiceSelect={onServiceSelect} />
    </View>
  );
};

export default ServicesLocalScreen;
