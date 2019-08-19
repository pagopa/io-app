import * as pot from "italia-ts-commons/lib/pot";
import * as React from "react";
import {
  ListRenderItemInfo,
  RefreshControl,
  SectionList,
  SectionListData,
  StyleSheet
} from "react-native";

import { H3, ListItem } from "native-base";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import { ReadStateByServicesId } from "../../store/reducers/entities/services/readStateByServiceId";

import { ProfileState } from "../../store/reducers/profile";
import variables from "../../theme/variables";
import customVariables from "../../theme/variables";
import { getLogoForOrganization } from "../../utils/organizations";
import ItemSeparatorComponent from "../ItemSeparatorComponent";
import SectionHeaderComponent from "../screens/SectionHeaderComponent";
import NewServiceListItem from "./NewServiceListItem";
import { ServiceListItem } from "./ServiceListItem";

type OwnProps = {
  // Can't use ReadonlyArray because of the SectionList section prop
  // typescript definition.
  // tslint:disable-next-line:readonly-array
  sections: Array<SectionListData<pot.Pot<ServicePublic, Error>>>;
  profile: ProfileState;
  isRefreshing: boolean;
  onRefresh: () => void;
  onSelect: (service: ServicePublic) => void;
  readServices: ReadStateByServicesId;
  isExperimentalFeaturesEnabled?: boolean;
};

type Props = OwnProps;

const styles = StyleSheet.create({
  listItem: {
    paddingLeft: variables.contentPadding,
    paddingRight: variables.contentPadding
  },
  padded: {
    marginLeft: customVariables.contentPadding,
    marginRight: customVariables.contentPadding
  }
});

/**
 * A component to render a list of services grouped by organization.
 */
class ServiceSectionListComponent extends React.Component<Props> {
  private isRead = (
    potService: pot.Pot<ServicePublic, Error>,
    readServices: ReadStateByServicesId
  ): boolean => {
    const service =
      pot.isLoading(potService) ||
      pot.isError(potService) ||
      pot.isNone(potService)
        ? undefined
        : potService.value;

    return (
      readServices !== undefined &&
      service !== undefined &&
      readServices[service.service_id] !== undefined
    );
  };

  private renderServiceItem = (
    itemInfo: ListRenderItemInfo<pot.Pot<ServicePublic, Error>>
  ) =>
    this.props.isExperimentalFeaturesEnabled ? (
      <NewServiceListItem
        item={itemInfo.item}
        profile={this.props.profile}
        onSelect={this.props.onSelect}
        isRead={this.isRead(itemInfo.item, this.props.readServices)}
        hideSeparator={true}
      />
    ) : (
      <ServiceListItem
        item={itemInfo.item}
        profile={this.props.profile}
        onSelect={this.props.onSelect}
        isRead={this.isRead(itemInfo.item, this.props.readServices)}
      />
    );

  private getServiceKey = (
    potService: pot.Pot<ServicePublic, Error>,
    index: number
  ): string => {
    return pot.getOrElse(
      pot.map(
        potService,
        service => `${service.service_id}-${service.version || 0}`
      ),
      `service-pot-${index}`
    );
  };

  private renderServiceSectionHeader = (info: {
    section: SectionListData<pot.Pot<ServicePublic, Error>>;
  }): React.ReactNode =>
    this.props.isExperimentalFeaturesEnabled ? (
      <SectionHeaderComponent
        sectionHeader={info.section.organizationName}
        style={styles.padded}
        logoUri={getLogoForOrganization(info.section.organizationFiscalCode)}
      />
    ) : (
      <ListItem itemHeader={true} style={styles.listItem}>
        <H3>{info.section.organizationName}</H3>
      </ListItem>
    );

  public render() {
    const { sections, isRefreshing, onRefresh } = this.props;

    const refreshControl = (
      <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
    );

    return (
      <SectionList
        sections={sections}
        renderItem={this.renderServiceItem}
        renderSectionHeader={this.renderServiceSectionHeader}
        keyExtractor={this.getServiceKey}
        stickySectionHeadersEnabled={true}
        alwaysBounceVertical={false}
        refreshControl={refreshControl}
        ItemSeparatorComponent={ItemSeparatorComponent}
      />
    );
  }
}

export default ServiceSectionListComponent;
