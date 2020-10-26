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
import { ReadStateByServicesId } from "../../store/reducers/entities/services/readStateByServiceId";
import { ProfileState } from "../../store/reducers/profile";
import customVariables from "../../theme/variables";
import ButtonDefaultOpacity from "../ButtonDefaultOpacity";
import IconFont from "../ui/IconFont";
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
  onChooserAreasOfInterestPress?: () => void;
  selectedOrganizationsFiscalCodes?: Set<string>;
  isLocal?: boolean;
  isAll: boolean;
  onLongPressItem?: () => void;
  isLongPressEnabled: boolean;
  onItemSwitchValueChanged?: (
    service: ReadonlyArray<ServicePublic>,
    value: boolean
  ) => void;
  renderRightIcon?: (section: ServicesSectionState) => React.ReactNode;
  isRefreshing: boolean;
  onRefresh: () => void;
  onSelect: (service: ServicePublic) => void;
  readServices: ReadStateByServicesId;
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

class ServicesSectionsList extends React.PureComponent<Props> {
  private localListEmptyComponent() {
    return (
      this.props.isLocal && (
        <View style={styles.headerContentWrapper}>
          <Text style={styles.message}>
            {this.props.isSelectableOrgsEmpty
              ? I18n.t("services.areasOfInterest.selectMessageEmptyOrgs")
              : I18n.t("services.areasOfInterest.selectMessage")}
          </Text>
          <View spacer={true} large={true} />
          <ButtonDefaultOpacity
            small={true}
            primary={true}
            style={styles.button}
            block={true}
            onPress={this.props.onChooserAreasOfInterestPress}
            disabled={this.props.isSelectableOrgsEmpty}
          >
            <IconFont name="io-plus" style={styles.icon} />
            <Text style={styles.textButton}>
              {I18n.t("services.areasOfInterest.addButton")}
            </Text>
          </ButtonDefaultOpacity>
          <View spacer={true} extralarge={true} />
          <Image source={require("../../../img/services/icon-places.png")} />
        </View>
      )
    );
  }

  // component used when the list is empty
  private emptyListComponent() {
    return (
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
  }

  private renderEditButton = () =>
    this.props.isLocal &&
    this.props.selectedOrganizationsFiscalCodes &&
    this.props.selectedOrganizationsFiscalCodes.size > 0 && (
      <View style={styles.headerContentWrapper}>
        <ButtonDefaultOpacity
          small={true}
          primary={!this.props.isLongPressEnabled}
          style={styles.button}
          block={true}
          onPress={this.props.onChooserAreasOfInterestPress}
          disabled={
            this.props.isRefreshing ||
            this.props.isLongPressEnabled ||
            this.props.isSelectableOrgsEmpty
          }
        >
          <Text style={styles.textButton}>
            {I18n.t("services.areasOfInterest.editButton")}
          </Text>
        </ButtonDefaultOpacity>
      </View>
    );

  private renderList = () => {
    // empty component is different from local and others (national and all)
    const emptyComponent = this.props.isLocal
      ? this.localListEmptyComponent()
      : this.emptyListComponent();
    return (
      <ServiceList
        renderUnreadState={!this.props.isAll}
        animated={this.props.animated}
        sections={this.props.sections}
        profile={this.props.profile}
        isRefreshing={this.props.isRefreshing}
        onRefresh={this.props.onRefresh}
        onSelect={this.props.onSelect}
        readServices={this.props.readServices}
        ListEmptyComponent={emptyComponent}
        onLongPressItem={this.props.onLongPressItem}
        isLongPressEnabled={this.props.isLongPressEnabled}
        onItemSwitchValueChanged={this.props.onItemSwitchValueChanged}
        renderRightIcon={this.props.renderRightIcon}
      />
    );
  };

  public render() {
    return (
      <View style={styles.contentWrapper}>
        {this.renderEditButton()}
        {this.renderList()}
      </View>
    );
  }
}

export default ServicesSectionsList;
