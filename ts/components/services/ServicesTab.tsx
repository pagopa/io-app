/**
 * A component to render a tab containing a list of services organized in sections
 */
import * as React from "react";
import { Animated } from "react-native";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import { ServicesSectionState } from "../../store/reducers/entities/services";
import { withLightModalContext } from "../helpers/withLightModalContext";
import { LightModalContextInterface } from "../ui/LightModal";
import ServicesSectionsList from "./ServicesSectionsList";

type OwnProps = Readonly<{
  sections: ReadonlyArray<ServicesSectionState>;
  isRefreshing: boolean;
  onRefresh: (hideToast?: boolean) => void; // eslint-disable-line
  onServiceSelect: (service: ServicePublic) => void;
  tabScrollOffset: Animated.Value;
}>;

type Props = OwnProps & LightModalContextInterface;

const ServicesTab = (props: Props): React.ReactElement => {
  const onTabScroll = () => ({
    onScroll: Animated.event([
      {
        nativeEvent: {
          contentOffset: { y: props.tabScrollOffset }
        }
      }
    ]),
    scrollEventThrottle: 8
  });

  return (
    <ServicesSectionsList
      sections={props.sections}
      isRefreshing={props.isRefreshing}
      onRefresh={props.onRefresh}
      onSelect={props.onServiceSelect}
      animated={onTabScroll()}
    />
  );
};

export default withLightModalContext(ServicesTab);
