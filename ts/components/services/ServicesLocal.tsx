import { Option } from "fp-ts/lib/Option";
import React from "react";
import { NativeScrollEvent, NativeSyntheticEvent, View } from "react-native";
import { StyleSheet } from "react-native";
import { ComponentProps } from "../../types/react";
import ServiceList from "./ServiceList";
import ServiceSectionListComponent from "./ServiceSectionListComponent";
import { ServicesLocalHeader } from "./ServicesLocalHeader";

type AnimatedProps = {
  animated?: {
    onScroll: (_: NativeSyntheticEvent<NativeScrollEvent>) => void;
    scrollEventThrottle?: number;
  };
  paddingForAnimation: boolean;
  AnimatedCTAStyle?: any;
};

type OwnProps = {
  onChooserAreasOfInterestPress: () => void;
  organizationsFiscalCodesSelected: Option<Set<string>>;
};

type ServiceSectionListComponentProps =
  | "sections"
  | "profile"
  | "isRefreshing"
  | "onRefresh"
  | "onSelect"
  | "readServices";

type Props = OwnProps &
  AnimatedProps &
  Pick<
    ComponentProps<typeof ServiceSectionListComponent>,
    ServiceSectionListComponentProps
  >;

const styles = StyleSheet.create({
  contentWrapper: {
    flex: 1
  }
});

/**
 * A component to render a list of local services.
 */
class ServicesLocal extends React.PureComponent<Props> {
  public render() {
    const {
      onChooserAreasOfInterestPress,
      paddingForAnimation,
      organizationsFiscalCodesSelected
    } = this.props;
    return (
      <View style={styles.contentWrapper}>
        <ServicesLocalHeader
          onChooserAreasOfInterestPress={onChooserAreasOfInterestPress}
          paddingForAnimation={paddingForAnimation}
          organizationsFiscalCodesSelected={organizationsFiscalCodesSelected}
        />
        {this.renderList()}
      </View>
    );
  }

  private renderList = () => {
    const {
      animated,
      profile,
      sections,
      isRefreshing,
      onRefresh,
      onSelect,
      readServices
    } = this.props;
    return (
      <ServiceList
        animated={animated}
        sections={sections}
        profile={profile}
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
        onSelect={onSelect}
        readServices={readServices}
        isExperimentalFeaturesEnabled={true}
      />
    );
  };
}

export default ServicesLocal;
