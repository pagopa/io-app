import * as pot from "italia-ts-commons/lib/pot";
import { Content, View } from "native-base";
import * as React from "react";
import { FlatList, ListRenderItemInfo, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { BonusAvailable } from "../../../../definitions/content/BonusAvailable";
import { withLoadingSpinner } from "../../../components/helpers/withLoadingSpinner";
import ItemSeparatorComponent from "../../../components/ItemSeparatorComponent";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import GenericErrorComponent from "../../../components/screens/GenericErrorComponent";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import I18n from "../../../i18n";
import { navigateBack } from "../../../store/actions/navigation";
import { Dispatch } from "../../../store/actions/types";
import { GlobalState } from "../../../store/reducers/types";
import variables from "../../../theme/variables";
import { AvailableBonusItem } from "../components/AvailableBonusItem";
import { navigateToBonusRequestInformation } from "../navigation/action";
import { availableBonusesLoad } from "../store/actions/bonusVacanze";
import { availableBonusesSelector } from "../store/reducers/availableBonuses";
import { setStatusBarColorAndBackground } from "../../../utils/statusBar";

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
  private renderListItem = (info: ListRenderItemInfo<BonusAvailable>) => {
    const item = info.item;
    return (
      <AvailableBonusItem
        bonusItem={item}
        onPress={() => this.props.navigateToBonusRequest(item)}
      />
    );
  };

  public componentDidMount() {
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
      </BaseScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => {
  const potAvailableBonuses = availableBonusesSelector(state);
  return {
    availableBonusesList: pot.getOrElse(potAvailableBonuses, []),
    isLoading: pot.isLoading(potAvailableBonuses),
    // show error only when we have an error and no data to show
    isError: pot.isNone(potAvailableBonuses) && pot.isError(potAvailableBonuses)
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateBack: () => dispatch(navigateBack()),
  loadAvailableBonuses: () => dispatch(availableBonusesLoad.request()),
  // TODO Add the param to navigate to proper bonus by name (?)
  navigateToBonusRequest: (bonusItem: BonusAvailable) =>
    dispatch(navigateToBonusRequestInformation({ bonusItem }))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLoadingSpinner(AvailableBonusScreen));
