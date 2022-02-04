import * as React from "react";
import {
  FlatList,
  ListRenderItemInfo,
  SafeAreaView,
  StyleSheet
} from "react-native";
import { View } from "native-base";
import { widthPercentageToDP } from "react-native-responsive-screen";
import LinearGradient from "react-native-linear-gradient";
import I18n from "../../../../../i18n";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { getCategorySpecs } from "../../utils/filters";
import customVariables from "../../../../../theme/variables";
import { ProductCategoryEnum } from "../../../../../../definitions/cgn/merchants/ProductCategory";
import TouchableDefaultOpacity from "../../../../../components/TouchableDefaultOpacity";
import { H2 } from "../../../../../components/core/typography/H2";
import { IOColors } from "../../../../../components/core/variables/IOColors";

const styles = StyleSheet.create({
  body: {
    borderRadius: 8,
    backgroundColor: "white",
    shadowColor: "#17324D",
    shadowOffset: {
      width: 0,
      height: 3
    },
    shadowOpacity: 0.2,
    shadowRadius: 2.0,
    elevation: 4,
    flex: 1,
    marginBottom: 10,
    marginRight: widthPercentageToDP("2.93%"),
    width: widthPercentageToDP("42.13%")
  },
  container: {
    flexDirection: "column",
    paddingHorizontal: customVariables.contentPadding / 2,
    paddingVertical: 14
  }
});

const CgnMerchantsCategoriesSelectionScreen = () => {
  const renderCategoryElement = (
    info: ListRenderItemInfo<ProductCategoryEnum>
  ) => {
    const specs = getCategorySpecs(info.item);

    return specs.fold(null, s => (
      <LinearGradient
        colors={s.colors}
        useAngle={true}
        angle={57.23}
        style={styles.body}
      >
        <TouchableDefaultOpacity style={[IOStyles.flex, styles.container]}>
          <View style={[IOStyles.flex, IOStyles.row]}>
            <H2 color={"white"}>{I18n.t(s.nameKey)}</H2>
          </View>
          <View style={[{ alignItems: "flex-end" }]}>
            {s.icon({
              height: 32,
              width: 32,
              fill: IOColors.white,
              style: { justifyContent: "flex-end" }
            })}
          </View>
        </TouchableDefaultOpacity>
      </LinearGradient>
    ));
  };

  const categoriesToArray = Object.entries(ProductCategoryEnum).map(
    value => value[1]
  );

  return (
    <BaseScreenComponent
      goBack
      headerTitle={I18n.t("bonus.cgn.merchantsList.navigationTitle")}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView style={IOStyles.flex}>
        <View style={IOStyles.horizontalContentPadding}>
          <FlatList
            data={categoriesToArray}
            renderItem={renderCategoryElement}
            numColumns={2}
            keyExtractor={(item: ProductCategoryEnum) => item}
          />
        </View>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default CgnMerchantsCategoriesSelectionScreen;
