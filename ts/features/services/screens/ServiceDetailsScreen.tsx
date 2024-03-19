import React, { useEffect } from "react";
import { ScrollView, StyleSheet } from "react-native";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { IOStackNavigationRouteProps } from "../../../navigation/params/AppParamsList";
import { ServicesParamsList } from "../navigation/params";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { serviceByIdSelector } from "../../../store/reducers/entities/services/servicesById";
import { loadServiceDetail } from "../../../store/actions/services";
import { ServicePublic } from "../../../../definitions/backend/ServicePublic";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";

export type ServiceDetailsScreenNavigationParams = Readonly<{
  serviceId: ServiceId;
  // if true the service should be activated automatically
  // as soon as the screen is shown (used for custom activation
  // flows like PN)
  activate?: boolean;
}>;

type ServiceDetailsScreenProps = IOStackNavigationRouteProps<
  ServicesParamsList,
  "SERVICE_DETAIL"
>;

const styles = StyleSheet.create({
  scrollContentContainer: {
    flexGrow: 1
  }
});

export const ServiceDetailsScreen = ({ route }: ServiceDetailsScreenProps) => {
  const { serviceId } = route.params;

  const dispatch = useIODispatch();

  const servicePot = useIOSelector(state =>
    serviceByIdSelector(state, serviceId)
  );

  useEffect(() => {
    dispatch(loadServiceDetail.request(serviceId));
  }, [dispatch, serviceId]);

  if (pot.isLoading(servicePot)) {
    // TODO: add a loading screen
  }

  return pipe(
    servicePot,
    pot.toOption,
    O.fold(
      () => (
        // TODO: add error screen
        <></>
      ),
      service => <ServiceDetailsContent service={service} />
    )
  );
};

type ServiceDetailsContentProps = {
  service: ServicePublic;
};

const ServiceDetailsContent = (_: ServiceDetailsContentProps) => {
  useHeaderSecondLevel({
    title: "",
    supportRequest: true
  });

  return (
    <ScrollView contentContainerStyle={styles.scrollContentContainer}>
      {/* TODO: add service details */}
    </ScrollView>
  );
};
