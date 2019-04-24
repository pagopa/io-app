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
import { ProfileState } from "../../store/reducers/profile";
import variables from "../../theme/variables";
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
};

type Props = OwnProps;

const styles = StyleSheet.create({
  listItem: {
    paddingLeft: variables.contentPadding,
    paddingRight: variables.contentPadding
  }
});

/**
 * A component to render a list of services grouped by organization.
 */
class ServiceSectionListComponent extends React.Component<Props> {
  private renderServiceItem = (
    itemInfo: ListRenderItemInfo<pot.Pot<ServicePublic, Error>>
  ) => (
    <ServiceListItem
      item={itemInfo.item}
      profile={this.props.profile}
      onSelect={this.props.onSelect}
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
  }): React.ReactNode => (
    <ListItem itemHeader={true} style={styles.listItem}>
      <H3>{info.section.title}</H3>
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
        stickySectionHeadersEnabled={false}
        alwaysBounceVertical={false}
        refreshControl={refreshControl}
      />
    );
  }
}

export default ServiceSectionListComponent;
