import { left } from "fp-ts/lib/Either";
import { Option, some } from "fp-ts/lib/Option";
import I18n from "i18n-js";
import * as pot from "italia-ts-commons/lib/pot";
import { Tab } from "native-base";
import * as React from "react";
import { Animated, Platform, StyleSheet, TouchableOpacity } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import IconFont from "../../components/ui/IconFont";
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
import { makeFontStyleObject } from "../../theme/fonts";
import customVariables from "../../theme/variables";
import { getLogoForOrganization } from "../../utils/organizations";
import { isTextIncludedCaseInsensitive } from "../../utils/strings";
import ChooserListContainer from "../ChooserListContainer";
import { withLightModalContext } from "../helpers/withLightModalContext";
import { LightModalContextInterface } from "../ui/LightModal";
import OrganizationLogo from "./OrganizationLogo";
import ServicesSectionsList from "./ServicesSectionsList";

type OwnProps = Readonly<{
  heading: string;
  isLocal?: boolean;
  sections: ReadonlyArray<ServicesSectionState>;
  isRefreshing: boolean;
  onRefresh: (hideToast: boolean) => void;
  onServiceSelect: (service: ServicePublic) => void;
  handleOnLongPressItem: () => void;
  isLongPressEnabled: boolean;
  updateOrganizationsOfInterestMetadata?: (
    selectedItemIds: Option<Set<string>>
  ) => void;
  onItemSwitchValueChanged: (service: ServicePublic, value: boolean) => void;
  tabOffset: Animated.Value;
}>;

type Props = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  LightModalContextInterface;

const styles = StyleSheet.create({
  activeTextStyle: {
    ...makeFontStyleObject(Platform.select, "600"),
    fontSize: Platform.OS === "android" ? 16 : undefined,
    fontWeight: Platform.OS === "android" ? "normal" : "bold"
  },
  textStyle: {
    fontSize: customVariables.fontSizeSmall
  },
  organizationLogo: {
    marginBottom: 0
  },
  icon: {
    paddingHorizontal: (24 - 17) / 2 // (io-right icon width) - (io-trash icon width)
  }
});

class ServicesTab extends React.PureComponent<Props> {
  /**
   * For tab Locals
   */
  private renderOrganizationLogo = (organizationFiscalCode: string) => {
    return (
      <OrganizationLogo
        logoUri={getLogoForOrganization(organizationFiscalCode)}
        imageStyle={styles.organizationLogo}
      />
    );
  };

  private organizationContainsText(item: Organization, searchText: string) {
    return isTextIncludedCaseInsensitive(item.name, searchText);
  }

  private showChooserAreasOfInterestModal = () => {
    const {
      selectableOrganizations,
      hideModal,
      selectedOrganizations
    } = this.props;
    this.props.showModal(
      <ChooserListContainer<Organization>
        items={selectableOrganizations}
        initialSelectedItemIds={some(new Set(selectedOrganizations || []))}
        keyExtractor={(item: Organization) => item.fiscalCode}
        itemTitleExtractor={(item: Organization) => item.name}
        itemIconComponent={left((fiscalCode: string) =>
          this.renderOrganizationLogo(fiscalCode)
        )}
        onCancel={hideModal}
        onSave={this.onSaveAreasOfInterest}
        isRefreshEnabled={false}
        matchingTextPredicate={this.organizationContainsText}
        noSearchResultsSourceIcon={require("../../../img/services/icon-no-places.png")}
        noSearchResultsSubtitle={I18n.t("services.areasOfInterest.searchEmpty")}
      />
    );
  };

  private onSaveAreasOfInterest = (
    selectedFiscalCodes: Option<Set<string>>
  ) => {
    if (this.props.updateOrganizationsOfInterestMetadata) {
      this.setState({
        toastErrorMessage: I18n.t(
          "serviceDetail.onUpdateEnabledChannelsFailure"
        )
      });
      this.props.updateOrganizationsOfInterestMetadata(selectedFiscalCodes);
    }
    this.props.hideModal();
  };

  private renderLocalQuickSectionDeletion = (section: ServicesSectionState) => {
    const onPressItem = () => {
      if (this.props.userMetadata && this.props.selectedOrganizations) {
        const updatedAreasOfInterest = this.props.selectedOrganizations.filter(
          item => item !== section.organizationFiscalCode
        );
        this.setState({
          toastErrorMessage: I18n.t(
            "serviceDetail.onUpdateEnabledChannelsFailure"
          )
        });
        this.props.saveSelectedOrganizationItems(
          this.props.userMetadata,
          updatedAreasOfInterest
        );
      }
    };
    return (
      <TouchableOpacity onPress={onPressItem}>
        <IconFont
          name={"io-trash"}
          color={customVariables.brandMildGray}
          size={17}
          style={styles.icon}
        />
      </TouchableOpacity>
    );
  };

  private onTabScroll = (tabOffset: Animated.Value) => {
    return {
      onScroll: Animated.event(
        [
          {
            nativeEvent: {
              contentOffset: {
                y: tabOffset
              }
            }
          }
        ],
        { useNativeDriver: true }
      ),
      scrollEventThrottle: 8 // target is 120fps
    };
  };

  public render() {
    return (
      <Tab
        activeTextStyle={styles.activeTextStyle}
        textStyle={styles.textStyle}
        heading={this.props.heading}
      >
        <ServicesSectionsList
          isLocal={this.props.isLocal}
          sections={this.props.sections}
          profile={this.props.profile}
          isRefreshing={this.props.isRefreshing}
          onRefresh={() => this.props.onRefresh}
          onSelect={this.props.onServiceSelect}
          readServices={this.props.readServices}
          onChooserAreasOfInterestPress={
            this.props.isLocal
              ? this.showChooserAreasOfInterestModal
              : undefined
          }
          selectedOrganizationsFiscalCodes={
            this.props.isLocal
              ? new Set(this.props.selectedOrganizations || [])
              : undefined
          }
          onLongPressItem={this.props.handleOnLongPressItem}
          isLongPressEnabled={this.props.isLongPressEnabled}
          onItemSwitchValueChanged={this.props.onItemSwitchValueChanged}
          animated={this.onTabScroll(this.props.tabOffset)}
          renderRightIcon={
            this.props.isLocal
              ? this.renderLocalQuickSectionDeletion
              : undefined
          }
        />
      </Tab>
    );
  }
}

const mapStateToProps = (state: GlobalState) => {
  const localServicesSections = localServicesSectionsSelector(state);
  const selectableOrganizations = localServicesSections.map(
    (section: ServicesSectionState) => {
      return {
        name: section.organizationName,
        fiscalCode: section.organizationFiscalCode
      };
    }
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
