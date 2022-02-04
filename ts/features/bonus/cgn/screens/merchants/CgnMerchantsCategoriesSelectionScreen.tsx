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
  gridItem: {
    margin: customVariables.gridGutter / 2,
    padding: 30,
    flex: 1
  },
  container: {
    paddingHorizontal: customVariables.contentPadding / 2,
    paddingVertical: 14,
    marginBottom: 10,
    borderRadius: 8,
    width: widthPercentageToDP("42.13%"),
    backgroundColor: "white",
    shadowColor: "#00274e",
    shadowOffset: {
      width: 0,
      height: 5
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
    marginRight: widthPercentageToDP("2.93%")
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
        style={styles.container}
      >
        <TouchableDefaultOpacity style={IOStyles.flex}>
          <View style={IOStyles.row}>
            <H2 color={"white"} style={{ textTransform: "capitalize" }}>
              {I18n.t(s.nameKey)}
            </H2>
          </View>
          <View
            style={[
              IOStyles.row,
              { alignItems: "flex-end", alignSelf: "flex-end" }
            ]}
          >
            {s.icon({ height: 22, width: 22, fill: IOColors.white })}
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
