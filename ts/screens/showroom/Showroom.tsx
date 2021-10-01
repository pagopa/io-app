import { View } from "native-base";
import * as React from "react";
import { useEffect } from "react";
import { SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { IOStyles } from "../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import I18n from "../../i18n";
import { ColorsShowroom } from "./core/ColorsShowroom";
import { SelectionShowroom } from "./core/SelectionShowroom";
import { TypographyShowroom } from "./core/TypographyShowRoom";
import { OthersShowroom } from "./OthersShowroom";

const styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: "center"
  },

  scrollView: {
    width: "100%"
  },
  separator: {
    paddingTop: 25,
    paddingBottom: 25
  }
});

export const Showroom = () => {
  const ref = React.createRef<View>();

  const currentView = ref.current;

  useEffect(() => {
    if (currentView !== null) {
      // eslint-disable-next-line
      // RTron.log(JSON.stringify(ref.current.props.style));
    }
  }, [currentView]);

  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={I18n.t("profile.main.showroom")}
    >
      <SafeAreaView style={styles.body}>
        <ScrollView>
          <View style={IOStyles.horizontalContentPadding}>
            <ColorsShowroom />
            <View spacer={true} extralarge={true} />
            <TypographyShowroom />
            <SelectionShowroom />
            <View spacer={true} extralarge={true} />
            <OthersShowroom />
          </View>
        </ScrollView>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
