/**
 * A component to render a tab containing a list of services organized in sections
 */
import { left } from "fp-ts/lib/Either";
import { Option, some } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { createFactory } from "react";
import * as React from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import IconFont from "../../components/ui/IconFont";
import Switch from "../../components/ui/Switch";
import I18n from "../../i18n";
import { userMetadataUpsert } from "../../store/actions/userMetadata";
import { Organization } from "../../store/reducers/entities/organizations/organizationsAll";
import {
  localServicesSectionsSelector,
  organizationsOfInterestSelector,
  ServicesSectionState
} from "../../store/reducers/entities/services";
import { readServicesByIdSelector } from "../../store/reducers/entities/services/readStateByServiceId";
import { profileSelector } from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";
import {
  UserMetadata,
  userMetadataSelector
} from "../../store/reducers/userMetadata";
import customVariables from "../../theme/variables";
import { getLogoForOrganization } from "../../utils/organizations";
import { getEnabledChannelsForService } from "../../utils/profile";
import { isTextIncludedCaseInsensitive } from "../../utils/strings";
import ChooserListContainer from "../ChooserListContainer";
import { withLightModalContext } from "../helpers/withLightModalContext";
import { LightModalContextInterface } from "../ui/LightModal";
import OrganizationLogo from "./OrganizationLogo";
import ServicesSectionsList from "./ServicesSectionsList";

type OwnProps = Readonly<{
  isLocal?: boolean;
  isAll: boolean;
  updateToast?: () => void;
  sections: ReadonlyArray<ServicesSectionState>;
  isRefreshing: boolean;
  onRefresh: (hideToast?: boolean) => void; // eslint-disable-line
  onServiceSelect: (service: ServicePublic) => void;
  handleOnLongPressItem: () => void;
  isLongPressEnabled: boolean;
  updateOrganizationsOfInterestMetadata?: (
    selectedItemIds: Option<Set<string>>
  ) => void;
  onItemSwitchValueChanged: (
    services: ReadonlyArray<ServicePublic>,
    value: boolean
  ) => void;
  tabScrollOffset: Animated.Value;
}>;

type Props = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  LightModalContextInterface;

const ICON_SIZE = 17;

const styles = StyleSheet.create({
  organizationLogo: {
    marginBottom: 0
  },
  iconContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: (24 - ICON_SIZE) / 2 // (io-right icon width) - (io-trash icon width),
  }
});

const OrganizationsList = createFactory(ChooserListContainer<Organization>());

function renderOrganizationLogo(organizationFiscalCode: string) {
  return (
    <OrganizationLogo
      logoUri={getLogoForOrganization(organizationFiscalCode)}
      imageStyle={styles.organizationLogo}
    />
  );
}

function organizationContainsText(item: Organization, searchText: string) {
  return isTextIncludedCaseInsensitive(item.name, searchText);
}

class ServicesTab extends React.PureComponent<Props> {
  /**
   * For tab Locals
   */
  private showChooserAreasOfInterestModal = () => {
    const {
      selectableOrganizations,
      hideModal,
      selectedOrganizations
    } = this.props;

    this.props.showModal(
      <OrganizationsList
        items={selectableOrganizations}
        initialSelectedItemIds={some(new Set(selectedOrganizations || []))}
        keyExtractor={(item: Organization) => item.fiscalCode}
        itemTitleExtractor={(item: Organization) => item.name}
        itemIconComponent={left(renderOrganizationLogo)}
        onCancel={hideModal}
        onSave={this.onSaveAreasOfInterest}
        isRefreshEnabled={false}
        matchingTextPredicate={organizationContainsText}
        noSearchResultsSourceIcon={require("../../../img/services/icon-no-places.png")}
        noSearchResultsSubtitle={I18n.t("services.areasOfInterest.searchEmpty")}
      />
    );
  };

  private onSaveAreasOfInterest = (
    selectedFiscalCodes: Option<Set<string>>
  ) => {
    if (this.props.updateOrganizationsOfInterestMetadata) {
      if (this.props.updateToast) {
        this.props.updateToast();
      }
      this.props.updateOrganizationsOfInterestMetadata(selectedFiscalCodes);
    }
    this.props.hideModal();
  };

  private onPressItem = (section: ServicesSectionState) => {
    if (this.props.userMetadata && this.props.selectedOrganizations) {
      if (this.props.updateToast) {
        this.props.updateToast();
      }
      const updatedAreasOfInterest = this.props.selectedOrganizations.filter(
        item => item !== section.organizationFiscalCode
      );
      this.props.saveSelectedOrganizationItems(
        this.props.userMetadata,
        updatedAreasOfInterest
      );
    }
  };

  private renderLocalQuickSectionDeletion = (section: ServicesSectionState) => (
    <TouchableOpacity onPress={() => this.onPressItem(section)}>
      <View style={styles.iconContainer}>
        <IconFont
          name={"io-trash"}
          color={customVariables.brandMildGray}
          size={ICON_SIZE}
        />
      </View>
    </TouchableOpacity>
  );

  private renderSwitchAllOrganizationServices = (
    section: ServicesSectionState
  ) => {
    // retrieve all services
    const services = section.data.reduce(
      (
        acc: ReadonlyArray<ServicePublic>,
        curr: pot.Pot<ServicePublic, Error>
      ) => {
        const service = pot.getOrElse(curr, undefined);
        if (service) {
          return [...acc, service];
        }
        return acc;
      },
      []
    );
    // if at least one is enabled
    const isSwitchEnabled = services.some(service => {
      const uiEnabledChannels = getEnabledChannelsForService(
        this.props.profile,
        service.service_id
      );
      return uiEnabledChannels.inbox;
    });
    return (
      <Switch
        key={section.organizationFiscalCode}
        value={isSwitchEnabled}
        onValueChange={value => {
          if (services.length > 0) {
            this.props.onItemSwitchValueChanged(services, value);
          }
        }}
        disabled={
          pot.isLoading(this.props.profile) ||
          pot.isUpdating(this.props.profile)
        }
      />
    );
  };

  private onTabScroll = () => ({
    onScroll: Animated.event([
      {
        nativeEvent: {
          contentOffset: { y: this.props.tabScrollOffset }
        }
      }
    ]),
    scrollEventThrottle: 8
  });

  public render() {
    // the right icon in the organization section could be
    // - if long press is enabled: a switch to enable/disable all related services
    // - if the organization is local a button to remove it
    // - none
    const renderRightIcon = this.props.isLongPressEnabled
      ? this.renderSwitchAllOrganizationServices
      : this.props.isLocal
      ? this.renderLocalQuickSectionDeletion
      : undefined;
    return (
      <ServicesSectionsList
        isLocal={this.props.isLocal}
        isSelectableOrgsEmpty={this.props.selectableOrganizations.length === 0}
        isAll={this.props.isAll}
        sections={this.props.sections}
        profile={this.props.profile}
        isRefreshing={this.props.isRefreshing}
        onRefresh={this.props.onRefresh}
        onSelect={this.props.onServiceSelect}
        readServices={this.props.readServices}
        onChooserAreasOfInterestPress={
          this.props.isLocal ? this.showChooserAreasOfInterestModal : undefined
        }
        selectedOrganizationsFiscalCodes={
          this.props.isLocal
            ? new Set(this.props.selectedOrganizations || [])
            : undefined
        }
        onLongPressItem={this.props.handleOnLongPressItem}
        isLongPressEnabled={this.props.isLongPressEnabled}
        onItemSwitchValueChanged={this.props.onItemSwitchValueChanged}
        animated={this.onTabScroll()}
        renderRightIcon={renderRightIcon}
      />
    );
  }
}

const mapStateToProps = (state: GlobalState) => {
  const localServicesSections = localServicesSectionsSelector(state);
  const selectableOrganizations = localServicesSections.map(
    (section: ServicesSectionState) => ({
      name: section.organizationName,
      fiscalCode: section.organizationFiscalCode
    })
  );
  const potUserMetadata = userMetadataSelector(state);
  const userMetadata = pot.getOrElse(potUserMetadata, undefined);
  return {
    profile: profileSelector(state),
    readServices: readServicesByIdSelector(state),
    selectedOrganizations: organizationsOfInterestSelector(state),
    selectableOrganizations,
    userMetadata,
    potUserMetadata
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  saveSelectedOrganizationItems: (
    userMetadata: UserMetadata,
    selectedItemIds: ReadonlyArray<string>
  ) => {
    const metadata = userMetadata.metadata;
    const currentVersion: number = userMetadata.version;
    dispatch(
      userMetadataUpsert.request({
        ...userMetadata,
        version: currentVersion + 1,
        metadata: {
          ...metadata,
          organizationsOfInterest: selectedItemIds
        }
      })
    );
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLightModalContext(ServicesTab));
