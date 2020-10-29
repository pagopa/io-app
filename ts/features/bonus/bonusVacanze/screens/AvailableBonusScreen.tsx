import * as pot from "italia-ts-commons/lib/pot";
import { Content, View } from "native-base";
import * as React from "react";
import {
  FlatList,
  Linking,
  ListRenderItemInfo,
  Platform,
  SafeAreaView,
  StyleSheet
} from "react-native";
import { connect } from "react-redux";
import { fromNullable } from "fp-ts/lib/Option";
import { BonusAvailable } from "../../../../../definitions/content/BonusAvailable";
import { withLoadingSpinner } from "../../../../components/helpers/withLoadingSpinner";
import ItemSeparatorComponent from "../../../../components/ItemSeparatorComponent";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../../../components/screens/BaseScreenComponent";
import GenericErrorComponent from "../../../../components/screens/GenericErrorComponent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import { bpdEnabled } from "../../../../config";
import I18n from "../../../../i18n";
import { navigateBack } from "../../../../store/actions/navigation";
import { navigationHistoryPop } from "../../../../store/actions/navigationHistory";
import { Dispatch } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import variables from "../../../../theme/variables";
import { setStatusBarColorAndBackground } from "../../../../utils/statusBar";
import { bpdOnboardingStart } from "../../bpd/store/actions/onboarding";
import { AvailableBonusItem } from "../components/AvailableBonusItem";
import { bonusVacanzeStyle } from "../components/Styles";
import { availableBonuses } from "../data/availableBonuses";
import { navigateToBonusRequestInformation } from "../navigation/action";
import { loadAvailableBonuses } from "../store/actions/bonusVacanze";
import { availableBonusTypesSelector } from "../store/reducers/availableBonusesTypes";
import { ID_BONUS_VACANZE_TYPE, ID_BPD_TYPE } from "../utils/bonus";
import { actionWithAlert } from "../components/alert/ActionWithAlert";
import { storeUrl } from "../../../../utils/appVersion";
import { showToast } from "../../../../utils/showToast";

export type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const styles = StyleSheet.create({
  whiteContent: {
    backgroundColor: variables.colorWhite,
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
 * if the bonus is already active, the component shows the active bonus item and user can navigate to the bonus detail
 * instead if bonus is not active the user can navigate to the begin of request flow.
 */
class AvailableBonusScreen extends React.PureComponent<Props> {
  private openAppStore = () => {
    // storeUrl is not a webUrl, try to open it
    Linking.openURL(storeUrl).catch(() => {
      showToast(I18n.t("msgErrorUpdateApp"));
    });
  };

  private renderListItem = (info: ListRenderItemInfo<BonusAvailable>) => {
    const item = info.item;

    if (item.hidden === true) {
      return undefined;
    }

    // only bonus vacanze tap is handled
    const handlersMap: Map<number, (bonus: BonusAvailable) => void> = new Map<
      number,
      (bonus: BonusAvailable) => void
    >([
      [ID_BONUS_VACANZE_TYPE, bonus => this.props.navigateToBonusRequest(bonus)]
    ]);

    if (bpdEnabled) {
      handlersMap.set(ID_BPD_TYPE, _ => this.props.startBpdOnboarding());
    }

    return (
      <AvailableBonusItem
        bonusItem={item}
        onPress={() =>
          /**
           * The available bonuses metadata are stored on the github repository and handled by the flag hidden to show up through this list,
           * if a new bonus is visible from the github repository means that there's a new official version of the app which handles the newly added bonus.
           * If the handler is missing from the map user should update to correctly start the new flow, otherwise an alert appears to update the app from store.
           */
          fromNullable(handlersMap.get(item.id_type)).foldL(
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
        }
      />
    );
  };

  public componentDidMount() {
    // since this is the first screen of the Bonus Navigation Stack, avoid to put
    // logic inside this method because this screen will be mounted as soon the stack is created
    setStatusBarColorAndBackground("dark-content", variables.colorWhite);
  }

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
        <SafeAreaView style={bonusVacanzeStyle.flex}>
          <Content
            noPadded={true}
            scrollEnabled={false}
            style={styles.whiteContent}
          >
            <View style={styles.paddedContent}>
              <FlatList
                scrollEnabled={false}
                data={availableBonusesList}
                renderItem={this.renderListItem}
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

const mapStateToProps = (state: GlobalState) => {
  const potAvailableBonuses = availableBonusTypesSelector(state);
  return {
    // fallback to hardcode data if pot is none
    availableBonusesList: pot.getOrElse(potAvailableBonuses, availableBonuses),
    isLoading: pot.isLoading(potAvailableBonuses),
    // show error only when we have an error and no data to show
    isError: pot.isNone(potAvailableBonuses) && pot.isError(potAvailableBonuses)
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateBack: () => dispatch(navigateBack()),
  loadAvailableBonuses: () => dispatch(loadAvailableBonuses.request()),
  // TODO Add the param to navigate to proper bonus by name (?)
  navigateToBonusRequest: (bonusItem: BonusAvailable) => {
    dispatch(navigateToBonusRequestInformation({ bonusItem }));
    dispatch(navigationHistoryPop(1));
  },
  startBpdOnboarding: () => dispatch(bpdOnboardingStart())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLoadingSpinner(AvailableBonusScreen));
