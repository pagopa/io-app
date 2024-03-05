import { useFocusEffect } from "@react-navigation/native";
import * as React from "react";
import { useRef } from "react";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import { heightPercentageToDP } from "react-native-responsive-screen";
import SectionStatusComponent from "../../../components/SectionStatus";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
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

  useFocusEffect(
    React.useCallback(() => {
      setAccessibilityFocus(elementRef);
    }, [])
  );

  return (
    <BaseScreenComponent goBack={true} contextualHelp={emptyContextualHelp}>
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
      </SafeAreaView>
      {props.footer}
    </BaseScreenComponent>
  );
};
