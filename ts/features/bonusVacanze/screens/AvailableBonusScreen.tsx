import { fromNullable } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { Content, View } from "native-base";
import * as React from "react";
import { FlatList, ListRenderItemInfo, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { withLoadingSpinner } from "../../../components/helpers/withLoadingSpinner";
import ItemSeparatorComponent from "../../../components/ItemSeparatorComponent";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import GenericErrorComponent from "../../../components/screens/GenericErrorComponent";
import { ScreenContentHeader } from "../../../components/screens/ScreenContentHeader";
import I18n from "../../../i18n";
import { navigateBack } from "../../../store/actions/navigation";
import { Dispatch } from "../../../store/actions/types";
import { GlobalState } from "../../../store/reducers/types";
import variables from "../../../theme/variables";
import { maybeInnerProperty } from "../../../utils/options";
import ActiveBonus from "../components/ActiveBonus";
import AvailableBonusItem from "../components/AvailableBonusItem";
import { mockedBonus } from "../mock/mockData";
import { availableBonusesLoad } from "../store/actions/bonusVacanze";
import { availableBonusesSelector } from "../store/reducers/availableBonuses";
import { BonusItem, ID_TYPE_BONUS_VACANZE } from "../types/bonusList";
import { ID_BONUS_VACANZE_TYPE, isBonusActive } from "../utils/bonus";

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

/**
 * This component presents the list of available bonus the user can request
 * if the bonus is already active, the component shows the active bonus item and user can navigate to the bonus detail
 * instead if bonus is not active the user can navigate to the begin of request flow.
 */
class AvailableBonusScreen extends React.PureComponent<Props> {
  public componentDidMount() {
    this.props.loadAvailableBonuses();
  }

  private renderListItem = (info: ListRenderItemInfo<BonusItem>) => {
    const { activeBonus } = this.props;
    const item = info.item;
    const bonusVacanzeCategory = this.props.availableBonusesList.items.find(
      bi => bi.id_type === ID_BONUS_VACANZE_TYPE
    );
    const validFrom = maybeInnerProperty(
      bonusVacanzeCategory,
      "valid_from",
      _ => _
    ).fold(undefined, _ => _);
    const validTo = maybeInnerProperty(
      bonusVacanzeCategory,
      "valid_to",
      _ => _
    ).fold(undefined, _ => _);
    return item.id_type === ID_TYPE_BONUS_VACANZE &&
      pot.getOrElse(pot.map(activeBonus, b => isBonusActive(b)), false) ? (
      <ActiveBonus
        validFrom={validFrom}
        validTo={validTo}
        bonus={activeBonus.value}
        onPress={this.props.navigateToBonusDetail}
      />
    ) : (
      <AvailableBonusItem
        bonusItem={item}
        onPress={this.props.navigateToBonusRequest}
      />
    );
  };

  public render() {
    const { availableBonusesList, isError } = this.props;
    return isError ? (
      <GenericErrorComponent
        onRetry={this.props.loadAvailableBonuses}
        onCancel={this.props.navigateBack}
      />
    ) : (
      <BaseScreenComponent
        goBack={true}
        headerTitle={I18n.t("bonus.bonusList.title")}
      >
        <Content
          noPadded={true}
          scrollEnabled={false}
          style={styles.whiteContent}
        >
          <ScreenContentHeader title={I18n.t("bonus.bonusList.contentTitle")} />
          <View style={styles.paddedContent}>
            <FlatList
              scrollEnabled={false}
              data={availableBonusesList.items}
              renderItem={this.renderListItem}
              keyExtractor={item => item.id_type.toString()}
              ItemSeparatorComponent={() => (
                <ItemSeparatorComponent noPadded={true} />
              )}
            />
          </View>
        </Content>
      </BaseScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => {
  const potAvailableBonuses = availableBonusesSelector(state);
  return {
    activeBonus: pot.some(mockedBonus),
    availableBonusesList: pot.getOrElse(potAvailableBonuses, { items: [] }),
    isLoading: pot.isLoading(potAvailableBonuses),
    isError: pot.isError(potAvailableBonuses)
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateBack: () => dispatch(navigateBack()),
  loadAvailableBonuses: () => dispatch(availableBonusesLoad.request()),
  // TODO Add the param to navigate to proper bonus by name (?)
  navigateToBonusRequest: () => dispatch(navigateBack()),
  // TODO Add the param to bonus detail if a bonus is already active
  navigateToBonusDetail: () => dispatch(navigateBack())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLoadingSpinner(AvailableBonusScreen));
