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
import { ProfileState } from "../../store/reducers/profile";
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
  profile: ProfileState;
  renderRightIcon?: (section: ServicesSectionState) => React.ReactNode;
  isRefreshing: boolean;
  onRefresh: () => void;
  onSelect: (service: ServicePublic) => void;
  isSelectableOrgsEmpty?: boolean;
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
  message: {
    fontSize: customVariables.fontSizeBase,
    textAlign: "left"
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 0,
    paddingBottom: 0
  },
  textButton: {
    paddingLeft: 0,
    paddingRight: 0
  },
  icon: {
    color: customVariables.brandPrimaryInverted,
    lineHeight: 24
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

class ServicesSectionsList extends React.PureComponent<Props> {
  private renderList = () => (
    <ServiceList
      animated={this.props.animated}
      sections={this.props.sections}
      profile={this.props.profile}
      isRefreshing={this.props.isRefreshing}
      onRefresh={this.props.onRefresh}
      onSelect={this.props.onSelect}
      ListEmptyComponent={emptyListComponent()}
      renderRightIcon={this.props.renderRightIcon}
    />
  );

  public render() {
    return <View style={styles.contentWrapper}>{this.renderList()}</View>;
  }
}

export default ServicesSectionsList;
