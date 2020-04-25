/**
 * A component to render a list of services grouped by organization.
 */
import * as pot from "italia-ts-commons/lib/pot";
import React from "react";
import {
  Animated,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  SectionList,
  SectionListData,
  StyleSheet,
  Vibration
} from "react-native";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import { ServicesSectionState } from "../../store/reducers/entities/services";
import { ReadStateByServicesId } from "../../store/reducers/entities/services/readStateByServiceId";
import { ProfileState } from "../../store/reducers/profile";
import customVariables from "../../theme/variables";
import variables from "../../theme/variables";
import { getLogoForOrganization } from "../../utils/organizations";
import ItemSeparatorComponent from "../ItemSeparatorComponent";
import { EdgeBorderComponent } from "../screens/EdgeBorderComponent";
import SectionHeaderComponent from "../screens/SectionHeaderComponent";
import NewServiceListItem from "./NewServiceListItem";

type AnimatedProps = {
  animated?: {
    onScroll: (_: NativeSyntheticEvent<NativeScrollEvent>) => void;
    scrollEventThrottle?: number;
  };
};

type OwnProps = {
  sections: ReadonlyArray<SectionListData<pot.Pot<ServicePublic, Error>>>;
  profile: ProfileState;
  isRefreshing: boolean;
  onRefresh: () => void;
  onSelect: (service: ServicePublic) => void;
  readServices: ReadStateByServicesId;
  ListEmptyComponent?: React.ComponentProps<
    typeof SectionList
  >["ListEmptyComponent"];
  onLongPressItem?: () => void;
  isLongPressEnabled: boolean;
  onItemSwitchValueChanged?: (
    services: ReadonlyArray<ServicePublic>,
    value: boolean
  ) => void;
  renderRightIcon?: (selectedOrgId: ServicesSectionState) => React.ReactNode;
};

type Props = OwnProps & AnimatedProps;

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

const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);
const VIBRATION_LONG_PRESS_DURATION = 100 as Millisecond;
class ServiceList extends React.Component<Props> {
  private sectionListRef = React.createRef<typeof AnimatedSectionList>();

  private handleLongPressItem = () => {
    if (this.props.onLongPressItem) {
      this.props.onLongPressItem();
      Vibration.vibrate(VIBRATION_LONG_PRESS_DURATION);
    }
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
      onLongPress={this.handleLongPressItem}
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
    section: ServicesSectionState;
  }): React.ReactNode => (
    <SectionHeaderComponent
      sectionHeader={info.section.organizationName}
      style={styles.padded}
      logoUri={getLogoForOrganization(info.section.organizationFiscalCode)}
      rightItem={
        this.props.renderRightIcon && this.props.renderRightIcon(info.section)
      }
    />
  );

  private isRead = (
    potService: pot.Pot<ServicePublic, Error>,
    readServices: ReadStateByServicesId
  ): boolean => {
    return pot.getOrElse(
      pot.map(potService, s => s && readServices[s.service_id] !== undefined),
      false
    );
  };

  public render() {
    const {
      sections,
      isRefreshing,
      onRefresh,
      ListEmptyComponent
    } = this.props;

    const refreshControl = (
      <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
    );

    return (
      <AnimatedSectionList
        ref={this.sectionListRef}
        scrollEnabled={true}
        scrollEventThrottle={
          this.props.animated
            ? this.props.animated.scrollEventThrottle
            : undefined
        }
        onScroll={
          this.props.animated ? this.props.animated.onScroll : undefined
        }
        sections={sections}
        renderItem={this.renderServiceItem}
        renderSectionHeader={this.renderServiceSectionHeader}
        keyExtractor={this.getServiceKey}
        stickySectionHeadersEnabled={true}
        alwaysBounceVertical={true}
        refreshControl={refreshControl}
        ItemSeparatorComponent={ItemSeparatorComponent}
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={sections.length > 0 && <EdgeBorderComponent />}
      />
    );
  }
}

export default ServiceList;
