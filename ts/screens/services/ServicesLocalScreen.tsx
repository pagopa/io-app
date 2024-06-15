import React, { useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import { IOStyles } from "../../components/core/variables/IOStyles";
import LocalServicesWebView from "../../components/services/LocalServicesWebView";
import { showServiceDetails } from "../../store/actions/services";
import { useIODispatch } from "../../store/hooks";
import { useIONavigation } from "../../navigation/params/AppParamsList";
import { SERVICES_ROUTES } from "../../features/services/common/navigation/routes";

const styles = StyleSheet.create({
  contentWrapper: {
    flex: 1
  }
});

const ServicesLocalScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

  const onServiceSelect = useCallback(
    (service: ServicePublic) => {
      // when a service gets selected the service is recorded as read
      dispatch(showServiceDetails(service));
      navigation.navigate(SERVICES_ROUTES.SERVICES_NAVIGATOR, {
        screen: SERVICES_ROUTES.SERVICE_DETAIL,
        params: { serviceId: service.service_id }
      });
    },
    [dispatch, navigation]
  );

  return (
    <View style={[styles.contentWrapper, IOStyles.topListBorderBelowTabsStyle]}>
      {/* TODO: This is a workaround to make sure that the list is not placed under the tab bar
      https://pagopa.atlassian.net/jira/software/projects/IOAPPFD0/boards/313?selectedIssue=IOAPPFD0-40 */}
      <View style={{ marginTop: 0.1 }} />
      <LocalServicesWebView onServiceSelect={onServiceSelect} />
    </View>
  );
};

export default ServicesLocalScreen;
