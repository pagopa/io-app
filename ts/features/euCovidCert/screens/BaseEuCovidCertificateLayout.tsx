import { useFocusEffect } from "@react-navigation/native";
import * as React from "react";
import { useRef } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { heightPercentageToDP } from "react-native-responsive-screen";
import SectionStatusComponent from "../../../components/SectionStatus";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import { WithTestID } from "../../../types/WithTestID";
import { setAccessibilityFocus } from "../../../utils/accessibility";

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

export const BaseEuCovidCertificateLayout = ({
  testID,
  header,
  content,
  footer
}: Props) => {
  const elementRef = useRef(null);

  useHeaderSecondLevel({
    supportRequest: true,
    title: ""
  });

  useFocusEffect(
    React.useCallback(() => {
      setAccessibilityFocus(elementRef);
    }, [])
  );

  return (
    <>
      <ScrollView style={IOStyles.horizontalContentPadding} testID={testID}>
        {/* if the header is not defined put an empty header that works as a spacer
          (design directions, to avoid content too close with the top of the screen) */}
        {header ?? <View style={styles.emptyHeader} />}
        {content}
      </ScrollView>
      <SectionStatusComponent sectionKey={"euCovidCert"} />
      {footer}
    </>
  );
};
