import { Divider, FooterActions, IOToast } from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import {
  FlatList,
  Linking,
  ListRenderItemInfo,
  Platform,
  SafeAreaView,
  ScrollView
} from "react-native";
import { connect } from "react-redux";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { BonusAvailable } from "../../../../../definitions/content/BonusAvailable";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../../../components/screens/BaseScreenComponent";
import GenericErrorComponent from "../../../../components/screens/GenericErrorComponent";
import I18n from "../../../../i18n";
import {
  navigateBack,
  navigateToServiceDetailsScreen
} from "../../../../store/actions/navigation";
import { Dispatch } from "../../../../store/actions/types";
import {
  isCGNEnabledSelector,
  isCdcEnabledSelector
} from "../../../../store/reducers/backendStatus/remoteConfig";
import { GlobalState } from "../../../../store/reducers/types";
import { storeUrl } from "../../../../utils/appVersion";
import { ServiceDetailsScreenRouteParams } from "../../../services/details/screens/ServiceDetailsScreen";
import { loadServiceDetail } from "../../../services/details/store/actions/details";
import { cgnActivationStart } from "../../cgn/store/actions/activation";
import {
  AvailableBonusItem,
  AvailableBonusItemState
} from "../components/AvailableBonusItem";
import { actionWithAlert } from "../components/alert/ActionWithAlert";
import { loadAvailableBonuses } from "../store/actions/availableBonusesTypes";
import {
  experimentalAndVisibleBonus,
  isAvailableBonusLoadingSelector,
  isAvailableBonusNoneErrorSelector,
  serviceFromAvailableBonusSelector,
  supportedAvailableBonusSelector
} from "../store/selectors";
import { ID_CDC_TYPE, ID_CGN_TYPE } from "../utils";

export type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "bonus.bonusList.contextualHelp.title",
  body: "bonus.bonusList.contextualHelp.body"
};

/**
 * This component presents the list of available bonus the user can request
 * Only the visible bonus are shown ('visible' or 'experimental')
 * - if the bonus handler is set, the relative item performs the handler
 * - if the bonus handler is not set and the bonus is 'visible':
 *    - it displays the 'incoming label' within the bonus
 *    TODO: with the current implementation this functionality doesn't work:
 *    - if the bonus is active (is_active = true) at on press it shows an alert that invites the user to update
 *    - if the bonus is not active at the on press it does nothing
 */
class AvailableBonusScreen extends React.PureComponent<Props> {
  public componentDidMount() {
    const cdcBonus = this.props.availableBonusesList
      .filter(experimentalAndVisibleBonus)
      .find(b => b.id_type === ID_CDC_TYPE);
    const cdcServiceId: string | undefined = cdcBonus?.service_id ?? undefined;

    // If the cdc service is not loaded try to load it
    if (this.props.isCdcEnabled && cdcServiceId) {
      this.props.serviceDetailsLoad(cdcServiceId as ServiceId);
    }
  }

  private openAppStore = () => {
    // storeUrl is not a webUrl, try to open it
    Linking.openURL(storeUrl).catch(() => {
      IOToast.error(I18n.t("msgErrorUpdateApp"));
    });
  };

  private renderListItem = (info: ListRenderItemInfo<BonusAvailable>) => {
    const item = info.item;

    const handlersMap: Map<number, (bonus: BonusAvailable) => void> = new Map<
      number,
      (bonus: BonusAvailable) => void
    >();

    if (this.props.isCgnEnabled) {
      handlersMap.set(ID_CGN_TYPE, _ => this.props.startCgnActivation());
    }
    if (this.props.isCdcEnabled) {
      handlersMap.set(ID_CDC_TYPE, _ => {
        pipe(
          this.props.cdcService(),
          O.fold(
            () => {
              // TODO: add mixpanel tracking and alert: https://pagopa.atlassian.net/browse/AP-14
              IOToast.show(I18n.t("bonus.cdc.serviceEntryPoint.notAvailable"));
            },
            s => () =>
              this.props.navigateToServiceDetailsScreen({
                serviceId: s.service_id
              })
          )
        );
      });
    }
    const handled = handlersMap.has(item.id_type);
    // if bonus is experimental but there is no handler, it won't be shown
    if (item.visibility === "experimental" && !handled) {
      return null;
    }

    /**
     * The available bonuses metadata are stored on the github repository and handled by the flag hidden to show up through this list,
     * if a new bonus is visible (hidden=false) and active from the github repository means that there's a new official version of the app which handles the newly added bonus.
     */
    const onItemPress = () => {
      // if the bonus is active ask for app update
      pipe(
        handlersMap.get(item.id_type),
        O.fromNullable,
        O.fold(
          () =>
            actionWithAlert({
              title: I18n.t("titleUpdateAppAlert"),
              body: I18n.t("messageUpdateAppAlert", {
                storeName: Platform.select({
                  ios: "App Store",
                  default: "Play Store"
                })
              }),
              cancelText: I18n.t("global.buttons.cancel"),
              confirmText: I18n.t("openStore", {
                storeName: Platform.select({
                  ios: "App Store",
                  default: "Play Store"
                })
              }),
              onConfirmAction: this.openAppStore
            }),
          h => h(item)
        )
      );
    };

    // TODO: this behavior with the current implementation never occurs!
    // when the bonus is visible but this app version cant handle it
    const maybeIncoming: O.Option<AvailableBonusItemState> =
      item.visibility === "visible" && !handled ? O.some("incoming") : O.none;

    const state: AvailableBonusItemState = pipe(
      maybeIncoming,
      O.getOrElseW(() => "active" as const)
    );

    return (
      <AvailableBonusItem
        bonusItem={item}
        onPress={onItemPress}
        state={state}
      />
    );
  };

  public render() {
    const { availableBonusesList, isError } = this.props;

    return isError ? (
      <GenericErrorComponent
        onRetry={this.props.loadAvailableBonuses}
        onCancel={this.props.navigateBack}
        subText={" "}
      />
    ) : (
      <BaseScreenComponent
        goBack={true}
        headerTitle={I18n.t("bonus.bonusList.title")}
        contextualHelpMarkdown={contextualHelpMarkdown}
        faqCategories={["bonus_available_list"]}
      >
        <SafeAreaView style={IOStyles.flex}>
          <ScrollView contentContainerStyle={IOStyles.horizontalContentPadding}>
            <FlatList
              scrollEnabled={false}
              data={availableBonusesList.filter(experimentalAndVisibleBonus)}
              renderItem={b => this.renderListItem(b)}
              keyExtractor={item => item.id_type.toString()}
              ItemSeparatorComponent={() => <Divider />}
            />
          </ScrollView>
        </SafeAreaView>
        <FooterActions
          actions={{
            type: "SingleButton",
            primary: {
              onPress: this.props.navigateBack,
              label: I18n.t("global.buttons.cancel")
            }
          }}
        />
      </BaseScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  availableBonusesList: supportedAvailableBonusSelector(state),
  isLoading: isAvailableBonusLoadingSelector(state),
  // show error only when we have an error and no data to show
  isError: isAvailableBonusNoneErrorSelector(state),
  isCgnEnabled: isCGNEnabledSelector(state),
  isCdcEnabled: isCdcEnabledSelector(state),
  cdcService: () => serviceFromAvailableBonusSelector(ID_CDC_TYPE)(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateBack: () => navigateBack(),
  loadAvailableBonuses: () => dispatch(loadAvailableBonuses.request()),
  startCgnActivation: () => dispatch(cgnActivationStart()),
  navigateToServiceDetailsScreen: (params: ServiceDetailsScreenRouteParams) =>
    navigateToServiceDetailsScreen(params),
  serviceDetailsLoad: (serviceId: ServiceId) => {
    dispatch(loadServiceDetail.request(serviceId));
  }
});

const AvailableBonusScreenFC: React.FunctionComponent<Props> = (
  props: Props
) => (
  <LoadingSpinnerOverlay isLoading={props.isLoading}>
    <AvailableBonusScreen {...props} />
  </LoadingSpinnerOverlay>
);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AvailableBonusScreenFC);
