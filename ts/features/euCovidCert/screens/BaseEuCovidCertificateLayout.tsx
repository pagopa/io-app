import { NavigationEvents } from "@react-navigation/compat";
import * as React from "react";
import { useRef } from "react";
import { View, SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { heightPercentageToDP } from "react-native-responsive-screen";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import SectionStatusComponent from "../../../components/SectionStatus";
import { WithTestID } from "../../../types/WithTestID";
import { setAccessibilityFocus } from "../../../utils/accessibility";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";

type Props = WithTestID<{
  header?: React.ReactElement;
  content: React.ReactElement;
  footer?: React.ReactElement;
}>;

const styles = StyleSheet.create({
  emptyHeader: {
    flex: 1,
    height: heightPercentageToDP("10%")
  }
});

export const BaseEuCovidCertificateLayout = (props: Props) => {
  const elementRef = useRef(null);
  return (
    <BaseScreenComponent goBack={true} contextualHelp={emptyContextualHelp}>
      <NavigationEvents onWillFocus={() => setAccessibilityFocus(elementRef)} />
      <SafeAreaView
        style={IOStyles.flex}
        testID={"BaseEuCovidCertificateLayout"}
        ref={elementRef}
      >
        <ScrollView
          style={IOStyles.horizontalContentPadding}
          testID={props.testID}
        >
          {/* if the header is not defined put an empty header that works as a spacer
          (design directions, to avoid content too close with the top of the screen) */}
          {props.header ?? <View style={styles.emptyHeader} />}
          {props.content}
        </ScrollView>
        <SectionStatusComponent sectionKey={"euCovidCert"} />
        {props.footer}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
