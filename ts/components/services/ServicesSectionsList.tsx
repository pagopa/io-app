/**
 * A component to render a list of services organized in sections, one for each organization.
 */
import { Text, View } from "native-base";
import React from "react";
import { Image, NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { StyleSheet } from "react-native";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import I18n from "../../i18n";
import { ServicesSectionState } from "../../store/reducers/entities/services";
import customVariables from "../../theme/variables";
import ServiceList from "./ServiceList";

type AnimatedProps = {
  animated?: {
    onScroll: (_: NativeSyntheticEvent<NativeScrollEvent>) => void;
    scrollEventThrottle?: number;
  };
};

type OwnProps = {
  sections: ReadonlyArray<ServicesSectionState>;
  isRefreshing: boolean;
  onRefresh: () => void;
  onSelect: (service: ServicePublic) => void;
};

type Props = AnimatedProps & OwnProps;

const styles = StyleSheet.create({
  contentWrapper: {
    flex: 1
  },
  headerContentWrapper: {
    paddingRight: customVariables.contentPadding,
    paddingLeft: customVariables.contentPadding,
    paddingTop: customVariables.contentPadding / 2,
    paddingBottom: customVariables.contentPadding / 2,
    alignItems: "center"
  },
  emptyListContentTitle: {
    paddingTop: customVariables.contentPadding,
    textAlign: "center"
  }
});

// component used when the list is empty
const emptyListComponent = () => (
  <View style={styles.headerContentWrapper}>
    <View spacer={true} large={true} />
    <Image
      source={require("../../../img/services/icon-loading-services.png")}
    />
    <Text style={styles.emptyListContentTitle}>
      {I18n.t("services.emptyListMessage")}
    </Text>
  </View>
);

const ServicesSectionsList = (props: Props) => (
  <View style={styles.contentWrapper}>
    <ServiceList
      animated={props.animated}
      sections={props.sections}
      isRefreshing={props.isRefreshing}
      onRefresh={props.onRefresh}
      onSelect={props.onSelect}
      ListEmptyComponent={emptyListComponent()}
    />
  </View>
);

export default ServicesSectionsList;
