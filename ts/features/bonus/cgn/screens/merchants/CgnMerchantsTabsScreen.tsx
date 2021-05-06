import * as React from "react";
import { connect } from "react-redux";
import { Platform, SafeAreaView, StyleSheet } from "react-native";
import { Tab, Tabs, View } from "native-base";
import { GlobalState } from "../../../../../store/reducers/types";
import { Dispatch } from "../../../../../store/actions/types";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import I18n from "../../../../../i18n";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { availableMerchants } from "../../__mock__/availableMerchants";
import { navigateToCgnMerchantDetail } from "../../navigation/actions";
import customVariables from "../../../../../theme/variables";
import { makeFontStyleObject } from "../../../../../theme/fonts";
import CgnMerchantsListView from "../../components/merchants/CgnMerchantsListView";
import { H1 } from "../../../../../components/core/typography/H1";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

export type TmpMerchantType = {
  name: string;
  category: string;
  location: string;
};

const styles = StyleSheet.create({
  tabBarContainer: {
    elevation: 0,
    height: 40
  },
  tabBarUnderline: {
    borderBottomColor: customVariables.tabUnderlineColor,
    borderBottomWidth: customVariables.tabUnderlineHeight
  },
  tabBarUnderlineActive: {
    height: customVariables.tabUnderlineHeight,
    // borders do not overlap each other, but stack naturally
    marginBottom: -customVariables.tabUnderlineHeight,
    backgroundColor: customVariables.contentPrimaryBackground
  },
  activeTextStyle: {
    ...makeFontStyleObject(Platform.select, "600"),
    fontSize: Platform.OS === "android" ? 16 : undefined,
    fontWeight: Platform.OS === "android" ? "normal" : "bold",
    color: customVariables.brandPrimary
  },
  textStyle: {
    color: customVariables.brandDarkGray
  }
});

/**
 * Screen that renders the list of the merchants which have an active discount for CGN
 * @param props
 * @constructor
 */
const CgnMerchantsTabsScreen: React.FunctionComponent<Props> = (
  props: Props
) => {
  const onItemPress = () => {
    // TODO Add the dispatch of merchant selected when the complete workflow is available
    props.navigateToMerchantDetail();
  };

  return (
    <BaseScreenComponent
      goBack
      headerTitle={I18n.t("bonus.cgn.merchantsList.navigationTitle")}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView style={IOStyles.flex}>
        <Tabs
          locked={true}
          tabContainerStyle={[styles.tabBarContainer, styles.tabBarUnderline]}
          tabBarUnderlineStyle={styles.tabBarUnderlineActive}
          initialPage={0}
        >
          <Tab
            activeTextStyle={styles.activeTextStyle}
            textStyle={styles.textStyle}
            heading={I18n.t("bonus.cgn.merchantsList.online")}
          >
            <CgnMerchantsListView
              merchantList={props.merchants}
              onItemPress={onItemPress}
            />
          </Tab>
          <Tab
            activeTextStyle={styles.activeTextStyle}
            textStyle={styles.textStyle}
            heading={I18n.t("bonus.cgn.merchantsList.places")}
          >
            <View style={[IOStyles.horizontalContentPadding, IOStyles.flex]}>
              {/* TODO PLACEHOLDER HERE GOES THE MAP */}
              <H1>{`${I18n.t("bonus.cgn.merchantsList.places")} TAB`}</H1>
            </View>
          </Tab>
        </Tabs>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapStateToProps = (_: GlobalState) => ({
  // FIXME replace with selector when available
  merchants: availableMerchants
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToMerchantDetail: () => dispatch(navigateToCgnMerchantDetail())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CgnMerchantsTabsScreen);
