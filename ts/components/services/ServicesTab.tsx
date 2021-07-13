/**
 * A component to render a tab containing a list of services organized in sections
 */
import { Option } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import * as React from "react";
import { Animated } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import { userMetadataUpsert } from "../../store/actions/userMetadata";
import {
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
import { withLightModalContext } from "../helpers/withLightModalContext";
import { LightModalContextInterface } from "../ui/LightModal";
import ServicesSectionsList from "./ServicesSectionsList";

type OwnProps = Readonly<{
  updateToast?: () => void;
  sections: ReadonlyArray<ServicesSectionState>;
  isRefreshing: boolean;
  onRefresh: (hideToast?: boolean) => void; // eslint-disable-line
  onServiceSelect: (service: ServicePublic) => void;
  updateOrganizationsOfInterestMetadata?: (
    selectedItemIds: Option<Set<string>>
  ) => void;
  tabScrollOffset: Animated.Value;
}>;

type Props = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  LightModalContextInterface;

class ServicesTab extends React.PureComponent<Props> {
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
    return (
      <ServicesSectionsList
        sections={this.props.sections}
        profile={this.props.profile}
        isRefreshing={this.props.isRefreshing}
        onRefresh={this.props.onRefresh}
        onSelect={this.props.onServiceSelect}
        animated={this.onTabScroll()}
      />
    );
  }
}

const mapStateToProps = (state: GlobalState) => {
  const potUserMetadata = userMetadataSelector(state);
  const userMetadata = pot.getOrElse(potUserMetadata, undefined);
  return {
    profile: profileSelector(state),
    readServices: readServicesByIdSelector(state),
    selectedOrganizations: organizationsOfInterestSelector(state),
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
