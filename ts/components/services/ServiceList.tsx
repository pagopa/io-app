/**
 * A component to render a list of services grouped by organization.
 */
import * as pot from "@pagopa/ts-commons/lib/pot";
import React from "react";
import {
  Animated,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  SectionList,
  SectionListData
} from "react-native";
import { IOVisualCostants } from "@pagopa/io-app-design-system";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import { getLogoForOrganization } from "../../utils/organizations";
import {
  TabBarItemPressType,
  withUseTabItemPressWhenScreenActive
} from "../helpers/withUseTabItemPressWhenScreenActive";

import ItemSeparatorComponent from "../ItemSeparatorComponent";
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
  isRefreshing: boolean;
  onRefresh: () => void;
  onSelect: (service: ServicePublic) => void;
  ListEmptyComponent?: React.ComponentProps<
    typeof SectionList
  >["ListEmptyComponent"];
};

type Props = OwnProps & AnimatedProps & TabBarItemPressType;

class ServiceList extends React.Component<Props> {
  componentDidMount() {
    const { setHasInternalTab: setHasInternalTab, setTabPressCallback } =
      this.props;

    setHasInternalTab(true);
    setTabPressCallback(() => () => {
      sectionListRef.current?.scrollToLocation({
        animated: true,
        itemIndex: 0,
        sectionIndex: 0,
        viewOffset: 0
      });
    });
  }

  private renderServiceItem = (
    itemInfo: ListRenderItemInfo<pot.Pot<ServicePublic, Error>>
  ) => (
    <NewServiceListItem
      item={itemInfo.item}
      onSelect={this.props.onSelect}
      hideSeparator={true}
    />
  );

  private getServiceKey = (
    potService: pot.Pot<ServicePublic, Error>,
    index: number
  ): string =>
    pot.getOrElse(
      pot.map(
        potService,
        service => `${service.service_id}-${service.version}`
      ),
      `service-pot-${index}`
    );

  private renderServiceSectionHeader = (info: {
    section: SectionListData<pot.Pot<ServicePublic, Error>>;
  }): React.ReactNode => (
    <SectionHeaderComponent
      sectionHeader={info.section.organizationName}
      logoUri={getLogoForOrganization(info.section.organizationFiscalCode)}
      accessibilityRole={"header"}
    />
  );

  public render() {
    const { sections, isRefreshing, onRefresh, ListEmptyComponent } =
      this.props;

    const refreshControl = (
      <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
    );

    return (
      <Animated.SectionList
        contentContainerStyle={{
          paddingHorizontal: IOVisualCostants.appMarginDefault
        }}
        ref={sectionListRef}
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
        testID="services-list"
      />
    );
  }
}

const sectionListRef = React.createRef<SectionList>();

export default withUseTabItemPressWhenScreenActive(ServiceList);
