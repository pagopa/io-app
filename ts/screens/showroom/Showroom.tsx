import { H1, H2, H3, View } from "native-base";
import * as React from "react";
import { useEffect } from "react";
import { SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { makeFontStyleObject } from "../../components/core/fonts";
import H4 from "../../components/ui/H4";
import H5 from "../../components/ui/H5";
import customVariables from "../../theme/variables";
import { ColorsSection } from "./ColorsSection";

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

  const asd = makeFontStyleObject("Regular", false, "TitilliumWeb");
  console.log(asd);

  return (
    <SafeAreaView style={styles.body}>
      <ScrollView style={styles.scrollView}>
        <ColorsSection />
        <H1>Header h1</H1>
        <View spacer={true} ref={ref} style={{ backgroundColor: "red" }} />
        <H2>Header h2</H2>
        <View spacer={true} />
        <H3>Header h3</H3>
        <View spacer={true} />
        <H4>Header h4</H4>
        <View spacer={true} />
        <H5>Header h5</H5>
      </ScrollView>
    </SafeAreaView>
  );
};
