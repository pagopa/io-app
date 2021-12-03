import { View } from "native-base";
import * as React from "react";
import { ActivityIndicator, SafeAreaView, ScrollView } from "react-native";
import { Body } from "../../../components/core/typography/Body";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { InfoScreenComponent } from "../../../components/infoScreen/InfoScreenComponent";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import I18n from "../../../i18n";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";

type Props = unknown;

const indicator = (
  <ActivityIndicator
    color={"black"}
    size={"large"}
    accessible={false}
    importantForAccessibility={"no-hide-descendants"}
    accessibilityElementsHidden={true}
  />
);

/**
 * The loading of the MVL remote data
 * @param _
 * @constructor
 */
export const MvlLoadingScreen = (_: Props): React.ReactElement => (
  <BaseScreenComponent goBack={true} contextualHelp={emptyContextualHelp}>
    <SafeAreaView style={IOStyles.flex} testID={"MvlLoadingScreen"}>
      <ScrollView style={[IOStyles.horizontalContentPadding]}>
        <View spacer={true} extralarge={true} />
        <View spacer={true} extralarge={true} />
        <View spacer={true} extralarge={true} />
        <InfoScreenComponent
          image={indicator}
          title={I18n.t("features.mvl.loading.title")}
          body={<Body>{I18n.t("features.mvl.loading.subtitle")}</Body>}
        />
      </ScrollView>
    </SafeAreaView>
  </BaseScreenComponent>
);
