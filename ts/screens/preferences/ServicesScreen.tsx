/**
 * Screen displaying the list of available services. The user can
 * access the service detail by pressing on the related list item.
 */
import { none, Option, some } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import debounce from "lodash/debounce";
import { Button, Icon, Input, Item, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";

import { ServiceId } from "../../../definitions/backend/ServiceId";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import ServiceSectionListComponent from "../../components/services/ServiceSectionListComponent";
import ServicesSearch from "../../components/services/ServicesSearch";
import IconFont from "../../components/ui/IconFont";
import Markdown from "../../components/ui/Markdown";
import I18n from "../../i18n";
import { contentServiceLoad } from "../../store/actions/content";
import { navigateToServiceDetailsScreen } from "../../store/actions/navigation";
import { loadVisibleServices } from "../../store/actions/services";
import { Dispatch, ReduxProps } from "../../store/actions/types";
import { GlobalState } from "../../store/reducers/types";
import variables from "../../theme/variables";
import { InferNavigationParams } from "../../types/react";
import { isDefined } from "../../utils/guards";
import ServiceDetailsScreen from "./ServiceDetailsScreen";

type OwnProps = NavigationInjectedProps;

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  ReduxProps &
  OwnProps;

type State = {
  searchText: Option<string>;
  debouncedSearchText: Option<string>;
};

const styles = StyleSheet.create({
  listItem: {
    paddingLeft: variables.contentPadding,
    paddingRight: variables.contentPadding
  },
  noSearchBarText: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  ioSearch: {
    paddingLeft: variables.contentPadding,
    paddingRight: variables.contentPadding
  }
});

class ServicesScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      searchText: none,
      debouncedSearchText: none
    };
  }
  private goBack = () => this.props.navigation.goBack();

  private onServiceSelect = (service: ServicePublic) => {
    // when a service gets selected, before navigating to the service detail
    // screen, we issue a contentServiceLoad to refresh the service metadata
    this.props.contentServiceLoad(service.service_id);
    this.props.navigateToServiceDetailsScreen({
      service
    });
  };

  public componentDidMount() {
    // on mount, update visible services
    this.props.refreshServices();
  }

  public render() {
    const { searchText } = this.state;

    return (
      <TopScreenComponent
        title={I18n.t("services.title")}
        goBack={this.goBack}
        subtitle={I18n.t("services.subTitle")}
        contextualHelp={{
          title: I18n.t("services.title"),
          body: () => <Markdown>{I18n.t("services.servicesHelp")}</Markdown>
        }}
      >
        {searchText.isSome() ? (
          <Item style={styles.ioSearch}>
            <Input
              placeholder={I18n.t("global.actions.search")}
              value={searchText.value}
              onChangeText={this.onSearchTextChange}
              autoFocus={true}
            />
            <Icon name="cross" onPress={this.onSearchDisable} />
          </Item>
        ) : (
          <Button
            onPress={this.onSearchEnable}
            transparent={true}
            style={styles.ioSearch}
          >
            <IconFont name="io-search" />
          </Button>
        )}

        {searchText.isSome() ? this.renderSearch() : this.renderList()}
      </TopScreenComponent>
    );
  }

  private renderList = () => {
    const { sections } = this.props;
    return (
      <ServiceSectionListComponent
        sections={sections}
        profile={this.props.profile}
        isRefreshing={this.props.isLoading}
        onRefresh={this.props.refreshServices}
        onSelect={this.onServiceSelect}
      />
    );
  };

  /**
   * Render ServicesSearch component.
   */
  private renderSearch = () => {
    const { refreshServices, sections } = this.props;

    const { debouncedSearchText } = this.state;

    return debouncedSearchText
      .map(
        _ =>
          _.length < 3 ? (
            this.renderInvalidSearchBarText()
          ) : (
            <ServicesSearch
              sectionsState={sections}
              profile={this.props.profile}
              onRefresh={refreshServices}
              navigateToServiceDetail={this.onServiceSelect}
              searchText={_}
            />
          )
      )
      .getOrElse(this.renderInvalidSearchBarText());
  };

  private renderInvalidSearchBarText = () => {
    return (
      <View style={styles.noSearchBarText}>
        <Text>{I18n.t("global.search.invalidSearchBarText")}</Text>
      </View>
    );
  };

  private onSearchEnable = () => {
    this.setState({
      searchText: some("")
    });
  };

  private onSearchTextChange = (text: string) => {
    this.setState({
      searchText: some(text)
    });
    this.updateDebouncedSearchText(text);
  };

  private updateDebouncedSearchText = debounce(
    (text: string) =>
      this.setState({
        debouncedSearchText: some(text)
      }),
    300
  );

  private onSearchDisable = () => {
    this.setState({
      searchText: none,
      debouncedSearchText: none
    });
  };
}

const mapStateToProps = (state: GlobalState) => {
  const { services, organizations } = state.entities;

  const orgfiscalCodes = Object.keys(services.byOrgFiscalCode);

  // tslint:disable-next-line:readonly-array
  const sections = orgfiscalCodes
    .map(fiscalCode => {
      const title = organizations[fiscalCode] || fiscalCode;
      const serviceIdsForOrg = services.byOrgFiscalCode[fiscalCode] || [];
      const data = serviceIdsForOrg
        .map(id => services.byId[id])
        .filter(isDefined);
      return {
        title,
        data
      };
    })
    .filter(_ => _.data.length > 0);

  const isAnyServiceLoading =
    Object.keys(services.byId).find(k => {
      const oneService = services.byId[k];
      return oneService !== undefined && pot.isLoading(oneService);
    }) !== undefined;

  const isLoading =
    pot.isLoading(state.entities.services.visible) || isAnyServiceLoading;

  return {
    profile: state.profile,
    sections,
    isLoading
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  refreshServices: () => dispatch(loadVisibleServices.request()),
  contentServiceLoad: (serviceId: ServiceId) =>
    dispatch(contentServiceLoad.request(serviceId)),
  navigateToServiceDetailsScreen: (
    params: InferNavigationParams<typeof ServiceDetailsScreen>
  ) => dispatch(navigateToServiceDetailsScreen(params))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ServicesScreen);
