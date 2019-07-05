import * as pot from "italia-ts-commons/lib/pot";
import { Button, Tab, TabHeading, Tabs, Text } from "native-base";
import * as React from "react";
import { Animated, ListRenderItemInfo, StyleSheet } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { connect } from "react-redux";
import { ChooserListComponent } from "../../components/ChooserListComponent";
import ChooserListItemComponent from "../../components/ChooserListItemComponent";
import { withLightModalContext } from "../../components/helpers/withLightModalContext";
import { withLoadingSpinner } from "../../components/helpers/withLoadingSpinner";
import { ScreenContentHeader } from "../../components/screens/ScreenContentHeader";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import { LightModalContextInterface } from "../../components/ui/LightModal";
import Markdown from "../../components/ui/Markdown";
import I18n from "../../i18n";
import { loadVisibleServices } from "../../store/actions/services";
import { Dispatch } from "../../store/actions/types";
import {
  Organization,
  organizationsAllSelector
} from "../../store/reducers/entities/organizations/organizationsAll";
import { GlobalState } from "../../store/reducers/types";
import customVariables from "../../theme/variables";

type OwnProps = NavigationScreenProps;

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  OwnProps &
  LightModalContextInterface;

type State = {
  currentTab: number;
};

// Scroll range is directly influenced by floating header height
const SCROLL_RANGE_FOR_ANIMATION = 72;

const styles = StyleSheet.create({
  tabBarContainer: {
    elevation: 0,
    height: 40
  },
  tabBarContent: {
    fontSize: customVariables.fontSizeSmall
  },
  tabBarUnderline: {
    borderBottomColor: customVariables.tabUnderlineColor,
    borderBottomWidth: customVariables.tabUnderlineHeight
  },
  tabBarUnderlineActive: {
    height: customVariables.tabUnderlineHeight,
    // borders do not overlap eachother, but stack naturally
    marginBottom: -customVariables.tabUnderlineHeight,
    backgroundColor: customVariables.contentPrimaryBackground
  },
  searchDisableIcon: {
    color: customVariables.headerFontColor
  }
});

const AnimatedTabs = Animated.createAnimatedComponent(Tabs);
/**
 * A screen that contains all the Tabs related to services.
 */
class ServicesHomeScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      currentTab: 0
    };
  }

  public componentDidMount() {
    // on mount, update visible services
    this.props.refreshServices();
  }

  private animatedScrollPositions: ReadonlyArray<Animated.Value> = [
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0)
  ];

  // tslint:disable-next-line: readonly-array
  private scollPositions: number[] = [0, 0, 0];

  public componentDidUpdate(_: Props, prevState: State) {
    // saving current list scroll position to enable header animation
    // when shifting between tabs
    if (prevState.currentTab !== this.state.currentTab) {
      this.animatedScrollPositions.map((__, i) => {
        // when current tab changes, listeners are not kept, so it is needed to
        // assign them again.
        this.animatedScrollPositions[i].removeAllListeners();
        this.animatedScrollPositions[i].addListener(animatedValue => {
          // tslint:disable-next-line: no-object-mutation
          this.scollPositions[i] = animatedValue.value;
        });
      });
    }
  }

  /**
   * For tab Locals
   */
  private renderOrganizationItem = (info: ListRenderItemInfo<Organization>) => {
    const item = info.item;
    return <ChooserListItemComponent title={item.name} />;
  };

  private showChooserLocalServicesModal = () => {
    const mockOrganizations: ReadonlyArray<any> = [
      {
        name: "Presidenza del Consiglio dei Ministri",
        fiscalCode: "1"
      },
      {
        name: "Comune di Milano",
        fiscalCode: "2"
      },
      {
        name: "Città di Torino",
        fiscalCode: "3"
      },
      {
        name: "ACI",
        fiscalCode: "4"
      },
      {
        name: "Comune di Ripalta Cremasca",
        fiscalCode: "5"
      },
      {
        name: "Comune di Valsamoggia",
        fiscalCode: "6"
      },
      {
        name:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        fiscalCode: "7"
      },
      {
        name:
          "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        fiscalCode: "8"
      },
      {
        name:
          "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.",
        fiscalCode: "9"
      },
      {
        name:
          "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.",
        fiscalCode: "10"
      },
      {
        name:
          "Proin gravida hendrerit lectus a. Tellus mauris a diam maecenas sed enim ut. Proin gravida hendrerit lectus a. Tellus mauris a diam maecenas sed enim ut.",
        fiscalCode: "11"
      },
      {
        name:
          "Nec feugiat in fermentum posuere urna. Sed lectus vestibulum mattis. Nec feugiat in fermentum posuere urna. Sed lectus vestibulum mattis.",
        fiscalCode: "12"
      },
      {
        name:
          "A arcu cursus vitae congue mauris. Hendrerit gravida rutrum quisque non tellus orci ac.",
        fiscalCode: "13"
      },
      {
        name:
          "Tortor id aliquet lectus proin nibh nisl condimentum id venenatis. Sit amet est placerat in egestas.",
        fiscalCode: "14"
      },
      {
        name:
          "Velit dignissim sodales ut eu sem integer vitae. Morbi tristique senectus et netus et malesuada fames ac turpis.",
        fiscalCode: "15"
      },
      {
        name:
          "Etiam dignissim diam quis enim lobortis scelerisque. Scelerisque fermentum dui faucibus in ornare quam viverra orci sagittis.",
        fiscalCode: "16"
      },
      {
        name:
          "Scelerisque purus semper eget duis at. Tristique senectus et netus et malesuada fames ac.",
        fiscalCode: "17"
      },
      {
        name:
          "Facilisi etiam dignissim diam quis enim. Velit aliquet sagittis id consectetur purus ut faucibus.",
        fiscalCode: "18"
      }
    ];

    this.props.showModal(
      <ChooserListComponent
        // items={this.props.allOrganizations}
        items={mockOrganizations}
        keyExtractor={item => item.fiscalCode}
        renderItem={this.renderOrganizationItem}
        onCancel={this.props.hideModal}
      />
    );
  };

  public render() {
    return (
      <TopScreenComponent
        title={I18n.t("services.title")}
        appLogo={true}
        contextualHelp={{
          title: I18n.t("services.title"),
          body: () => <Markdown>{I18n.t("services.servicesHelp")}</Markdown>
        }}
      >
        <React.Fragment>
          <ScreenContentHeader
            title={I18n.t("services.title")}
            icon={require("../../../img/icons/services-icon.png")}
            fixed={true}
          />
          {this.renderTabs()}
        </React.Fragment>
      </TopScreenComponent>
    );
  }

  /**
   * Render Locals, Nationals and Other services tabs.
   */
  private renderTabs = () => {
    return (
      <AnimatedTabs
        tabContainerStyle={[styles.tabBarContainer, styles.tabBarUnderline]}
        tabBarUnderlineStyle={styles.tabBarUnderlineActive}
        onChangeTab={(evt: any) => {
          this.setState({ currentTab: evt.i });
        }}
        initialPage={0}
        style={{
          transform: [
            {
              translateY: SCROLL_RANGE_FOR_ANIMATION
            }
          ]
        }}
      >
        <Tab
          heading={
            <TabHeading>
              <Text style={styles.tabBarContent}>
                {I18n.t("services.tab.locals")}
              </Text>
            </TabHeading>
          }
        >
          <Button onPress={this.showChooserLocalServicesModal} primary={false}>
            <Text>Aggiungi le tue aree di interesse</Text>
          </Button>
        </Tab>
        <Tab
          heading={
            <TabHeading>
              <Text style={styles.tabBarContent}>
                {I18n.t("services.tab.national")}
              </Text>
            </TabHeading>
          }
        />
        <Tab
          heading={
            <TabHeading>
              <Text style={styles.tabBarContent}>
                {I18n.t("services.tab.otherServices")}
              </Text>
            </TabHeading>
          }
        />
      </AnimatedTabs>
    );
  };
}

const mapStateToProps = (state: GlobalState) => {
  const isLoading = pot.isLoading(state.entities.services.visible);
  return {
    allOrganizations: organizationsAllSelector(state),
    isLoading
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  refreshServices: () => dispatch(loadVisibleServices.request())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLightModalContext(withLoadingSpinner(ServicesHomeScreen)));
