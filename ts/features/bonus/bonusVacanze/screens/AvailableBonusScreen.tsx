import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Content } from "native-base";
import * as React from "react";
import {
  View,
  Alert,
  FlatList,
  Linking,
  ListRenderItemInfo,
  Platform,
  SafeAreaView,
  StyleSheet
} from "react-native";
import { connect } from "react-redux";
import { BonusAvailable } from "../../../../../definitions/content/BonusAvailable";
import { BpdConfig } from "../../../../../definitions/content/BpdConfig";
import { withLoadingSpinner } from "../../../../components/helpers/withLoadingSpinner";
import ItemSeparatorComponent from "../../../../components/ItemSeparatorComponent";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../../../components/screens/BaseScreenComponent";
import GenericErrorComponent from "../../../../components/screens/GenericErrorComponent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import { bpdEnabled } from "../../../../config";
import I18n from "../../../../i18n";
import {
  navigateBack,
  navigateToServiceDetailsScreen
} from "../../../../store/actions/navigation";
import { Dispatch } from "../../../../store/actions/types";
import {
  bpdRemoteConfigSelector,
  isCdcEnabledSelector,
  isCGNEnabledSelector
} from "../../../../store/reducers/backendStatus";
import { GlobalState } from "../../../../store/reducers/types";
import variables from "../../../../theme/variables";
import { storeUrl } from "../../../../utils/appVersion";
import { getRemoteLocale } from "../../../../utils/messages";
import { showToast } from "../../../../utils/showToast";
import { bpdOnboardingStart } from "../../bpd/store/actions/onboarding";
import { cgnActivationStart } from "../../cgn/store/actions/activation";
import { actionWithAlert } from "../../common/components/alert/ActionWithAlert";
import {
  AvailableBonusItem,
  AvailableBonusItemState
} from "../components/AvailableBonusItem";
import { navigateToBonusRequestInformation } from "../navigation/action";
import { loadAvailableBonuses } from "../store/actions/bonusVacanze";
import {
  experimentalAndVisibleBonus,
  isAvailableBonusLoadingSelector,
  isAvailableBonusNoneErrorSelector,
  serviceFromAvailableBonusSelector,
  supportedAvailableBonusSelector
} from "../store/reducers/availableBonusesTypes";
import {
  ID_BONUS_VACANZE_TYPE,
  ID_BPD_TYPE,
  ID_CDC_TYPE,
  ID_CGN_TYPE
} from "../utils/bonus";

import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { ServicePublic } from "../../../../../definitions/backend/ServicePublic";
import { IOColors } from "../../../../components/core/variables/IOColors";
import { ServiceDetailsScreenNavigationParams } from "../../../../screens/services/ServiceDetailsScreen";
import {
  loadServiceDetail,
  showServiceDetails
} from "../../../../store/actions/services";
import { IOStyles } from "../../../../components/core/variables/IOStyles";

export type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const styles = StyleSheet.create({
  whiteContent: {
    backgroundColor: IOColors.white,
    flex: 1
  },
  paddedContent: {
    padding: variables.contentPadding,
    flex: 1
  }
});

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
      showToast(I18n.t("msgErrorUpdateApp"));
    });
  };

  private completedAlert = (title: string) => {
    Alert.alert(title, I18n.t("bonus.state.completed.description"));
  };

  private renderListItem = (
    info: ListRenderItemInfo<BonusAvailable>,
    bpdConfig: BpdConfig | undefined
  ) => {
    const item = info.item;

    // only bonus vacanze tap is handled
    const handlersMap: Map<number, (bonus: BonusAvailable) => void> = new Map<
      number,
      (bonus: BonusAvailable) => void
    >([
      [ID_BONUS_VACANZE_TYPE, bonus => this.props.navigateToBonusRequest(bonus)]
    ]);

    if (bpdEnabled) {
      const bpdHandler = () =>
        this.completedAlert(info.item[getRemoteLocale()].name);

      handlersMap.set(ID_BPD_TYPE, _ => bpdHandler());
    }

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
              showToast(I18n.t("bonus.cdc.serviceEntryPoint.notAvailable"));
            },
            s => () => {
              this.props.showServiceDetails(s);
              this.props.navigateToServiceDetailsScreen({
                serviceId: s.service_id
              });
            }
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

    // TODO: Atm only a custom case for the cashback, using the remote bpdConfiguration to choose if is finished
    // see https://pagopa.atlassian.net/browse/IAI-22 for the complete bonus refactoring
    const maybeFinished: O.Option<AvailableBonusItemState> =
      info.item.id_type === ID_BPD_TYPE && !bpdConfig?.program_active
        ? O.some("completed")
        : O.none;

    const state: AvailableBonusItemState = pipe(
      maybeIncoming,
      O.alt(() => maybeFinished),
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
    const cancelButtonProps = {
      block: true,
      light: true,
      bordered: true,
      onPress: this.props.navigateBack,
      title: I18n.t("global.buttons.cancel")
    };

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
          <Content
            noPadded={true}
            scrollEnabled={false}
            style={styles.whiteContent}
          >
            <View style={styles.paddedContent}>
              <FlatList
                scrollEnabled={false}
                data={availableBonusesList.filter(experimentalAndVisibleBonus)}
                renderItem={b => this.renderListItem(b, this.props.bpdConfig)}
                keyExtractor={item => item.id_type.toString()}
                ItemSeparatorComponent={() => (
                  <ItemSeparatorComponent noPadded={true} />
                )}
              />
            </View>
          </Content>
          <FooterWithButtons
            type={"SingleButton"}
            leftButton={cancelButtonProps}
          />
        </SafeAreaView>
      </BaseScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  availableBonusesList: supportedAvailableBonusSelector(state),
  isLoading: isAvailableBonusLoadingSelector(state),
  // show error only when we have an error and no data to show
  isError: isAvailableBonusNoneErrorSelector(state),
  bpdConfig: bpdRemoteConfigSelector(state),
  isCgnEnabled: isCGNEnabledSelector(state),
  isCdcEnabled: isCdcEnabledSelector(state),
  cdcService: () => serviceFromAvailableBonusSelector(ID_CDC_TYPE)(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateBack: () => navigateBack(),
  loadAvailableBonuses: () => dispatch(loadAvailableBonuses.request()),
  // TODO: Add the param to navigate to proper bonus by name (?)
  navigateToBonusRequest: (bonusItem: BonusAvailable) => {
    navigateToBonusRequestInformation({ bonusItem });
  },
  startBpdOnboarding: () => dispatch(bpdOnboardingStart()),
  startCgnActivation: () => dispatch(cgnActivationStart()),
  navigateToServiceDetailsScreen: (
    params: ServiceDetailsScreenNavigationParams
  ) => navigateToServiceDetailsScreen(params),
  serviceDetailsLoad: (serviceId: ServiceId) => {
    dispatch(loadServiceDetail.request(serviceId));
  },
  showServiceDetails: (service: ServicePublic) =>
    dispatch(showServiceDetails(service))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLoadingSpinner(AvailableBonusScreen));
