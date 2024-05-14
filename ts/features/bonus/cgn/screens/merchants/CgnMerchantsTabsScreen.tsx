import * as React from "react";
import { useContext, useState } from "react";
import { connect } from "react-redux";
import { SafeAreaView } from "react-native";
import { constNull } from "fp-ts/lib/function";
import { GlobalState } from "../../../../../store/reducers/types";
import { Dispatch } from "../../../../../store/actions/types";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import I18n from "../../../../../i18n";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { navigateToCgnMerchantDetail } from "../../navigation/actions";
import {
  BottomTopAnimation,
  LightModalContext
} from "../../../../../components/ui/LightModal";
import CgnMerchantsFilters from "../../components/merchants/CgnMerchantsFilters";
import { Merchant } from "../../../../../../definitions/cgn/merchants/Merchant";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

// const styles = StyleSheet.create({
//   tabBarContainer: {
//     elevation: 0,
//     height: 40
//   },
//   tabBarUnderline: {
//     borderBottomColor: customVariables.tabUnderlineColor,
//     borderBottomWidth: customVariables.tabUnderlineHeight
//   },
//   tabBarUnderlineActive: {
//     height: customVariables.tabUnderlineHeight,
//     // borders do not overlap each other, but stack naturally
//     marginBottom: -customVariables.tabUnderlineHeight,
//     backgroundColor: customVariables.contentPrimaryBackground
//   },
//   activeTextStyle: {
//     ...makeFontStyleObject("SemiBold"),
//     fontSize: Platform.OS === "android" ? 16 : undefined,
//     fontWeight: Platform.OS === "android" ? "normal" : "bold",
//     color: customVariables.brandPrimary
//   },
//   textStyle: {
//     color: customVariables.textColor
//   }
// });

/**
 * Screen that renders the list of the merchants which have an active discount for CGN
 *
 * This screen is unused and could be deprecated
 *
 *  @param props
 * @constructor
 */
const CgnMerchantsTabsScreen: React.FunctionComponent<Props> = (_: Props) => {
  const { showAnimatedModal, hideModal } = useContext(LightModalContext);
  const [selectedTab, __] = useState<"online" | "places">("online");

  // const onItemPress = () => {
  //   // TODO Add the dispatch of merchant selected when the complete workflow is available
  //   props.navigateToMerchantDetail();
  // };

  const openFiltersModal = () =>
    showAnimatedModal(
      // TODO replace onConfirm function when the search functionalities are defined
      <CgnMerchantsFilters
        onClose={hideModal}
        onConfirm={constNull}
        isLocal={selectedTab === "places"}
      />,
      BottomTopAnimation
    );

  return (
    <BaseScreenComponent
      goBack
      headerTitle={I18n.t("bonus.cgn.merchantsList.navigationTitle")}
      contextualHelp={emptyContextualHelp}
      isSearchAvailable={{ enabled: true, onSearchTap: openFiltersModal }}
    >
      <SafeAreaView style={IOStyles.flex}>
        {/* TABS component should be replaced with MaterialTopTab Navigator as done in Services and Messages home */}
        {/* <Tabs
          tabContainerStyle={[styles.tabBarContainer, styles.tabBarUnderline]}
          tabBarUnderlineStyle={styles.tabBarUnderlineActive}
          onChangeTab={(e: any) => {
            setSelectedTab(e.i === 1 ? "places" : "online");
          }}
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
               TODO PLACEHOLDER HERE GOES THE MAP 
              <H1>{`${I18n.t("bonus.cgn.merchantsList.places")} TAB`}</H1>
            </View>
          </Tab>
        </Tabs>
        <FooterWithButtons
          type={"SingleButton"}
          leftButton={confirmButtonProps(
            openFiltersModal,
            I18n.t("bonus.cgn.merchantsList.cta.filter")
          )}
        /> */}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapStateToProps = (_: GlobalState) => ({
  // FIXME replace with selector when available
  merchants: []
});

const mapDispatchToProps = (_: Dispatch) => ({
  navigateToMerchantDetail: () =>
    navigateToCgnMerchantDetail({ merchantID: "some" as Merchant["id"] })
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CgnMerchantsTabsScreen);
