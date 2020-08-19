import { View } from "native-base";
import * as React from "react";
import { useEffect } from "react";
import { SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { H1 } from "../../components/core/typography/H1";
import { H3 } from "../../components/core/typography/H3";
import { IOColors } from "../../components/core/variables/IOColors";
import customVariables from "../../theme/variables";
import { ColorsSection } from "./ColorsSection";
import { H2 } from "../../components/core/typography/H2";

const styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: "center",
    marginLeft: customVariables.contentPadding,
    marginRight: customVariables.contentPadding
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

  useEffect(() => {
    if (ref.current !== null) {
      // tslint:disable-next-line:no-commented-code
      // RTron.log(JSON.stringify(ref.current.props.style));
    }
  }, []);

  return (
    <SafeAreaView style={styles.body}>
      <ScrollView style={styles.scrollView}>
        <ColorsSection />
        <H1>Header h1</H1>
        <View style={{ backgroundColor: IOColors.bluegrey }}>
          <H1 color={"white"}>Header h1</H1>
        </View>
        <View spacer={true} ref={ref} />
        <H2>Header h2</H2>
        <View spacer={true} />
        <H3>Header h3</H3>
      </ScrollView>
    </SafeAreaView>
  );
};
