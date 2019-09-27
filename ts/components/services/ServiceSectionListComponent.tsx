import * as pot from "italia-ts-commons/lib/pot";
import * as React from "react";
import {
  ListRenderItemInfo,
  RefreshControl,
  SectionList,
  SectionListData,
  StyleSheet
} from "react-native";

import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import { ReadStateByServicesId } from "../../store/reducers/entities/services/readStateByServiceId";

import { ProfileState } from "../../store/reducers/profile";
import variables from "../../theme/variables";
import customVariables from "../../theme/variables";
import { getLogoForOrganization } from "../../utils/organizations";
import ItemSeparatorComponent from "../ItemSeparatorComponent";
import { EdgeBorderComponent } from "../screens/EdgeBorderComponent";
import SectionHeaderComponent from "../screens/SectionHeaderComponent";
import NewServiceListItem from "./NewServiceListItem";

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
  onLongPressItem?: () => void;
  isLongPressEnabled: boolean;
  onItemSwitchValueChanged?: (service: ServicePublic, value: boolean) => void;
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
  ) => (
    <NewServiceListItem
      item={itemInfo.item}
      profile={this.props.profile}
      onSelect={this.props.onSelect}
      isRead={this.isRead(itemInfo.item, this.props.readServices)}
      hideSeparator={true}
      onLongPress={this.props.onLongPressItem}
      onItemSwitchValueChanged={this.props.onItemSwitchValueChanged}
      isLongPressEnabled={this.props.isLongPressEnabled}
    />
  );

  private getServiceKey = (
    potService: pot.Pot<ServicePublic, Error>,
    index: number
  ): string => {
    return pot.getOrElse(
      pot.map(
        potService,
        service => `${service.service_id}-${service.version}`
      ),
      `service-pot-${index}`
    );
  };

  private renderServiceSectionHeader = (info: {
    section: SectionListData<pot.Pot<ServicePublic, Error>>;
  }): React.ReactNode => (
    <SectionHeaderComponent
      sectionHeader={info.section.organizationName}
      style={styles.padded}
      logoUri={getLogoForOrganization(info.section.organizationFiscalCode)}
    />
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
        ListFooterComponent={sections.length > 0 && <EdgeBorderComponent />}
      />
    );
  }
}

export default ServiceSectionListComponent;
