import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import { IOStyles } from "../../components/core/variables/IOStyles";
import LocalServicesWebView from "../../components/services/LocalServicesWebView";
import ROUTES from "../../navigation/routes";
import { showServiceDetails } from "../../store/actions/services";
import { useIODispatch } from "../../store/hooks";

const styles = StyleSheet.create({
  contentWrapper: {
    flex: 1
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
    <View
      style={[styles.contentWrapper, IOStyles.topListBorderBelowTabsStyle]}
    >
      {/* TODO: This is a workaround to make sure that the list is not placed under the tab bar
      https://pagopa.atlassian.net/jira/software/projects/IOAPPFD0/boards/313?selectedIssue=IOAPPFD0-40 */}
      <View style={{ marginTop: 0.1 }} />
      <LocalServicesWebView onServiceSelect={onServiceSelect} />
    </View>
  );
};

export default ServicesLocalScreen;
