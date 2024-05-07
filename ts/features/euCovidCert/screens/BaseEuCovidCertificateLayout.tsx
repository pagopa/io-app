import * as React from "react";
import { useRef } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { heightPercentageToDP } from "react-native-responsive-screen";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ButtonSolid, HSpacer } from "@pagopa/io-app-design-system";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import SectionStatusComponent from "../../../components/SectionStatus";
import { WithTestID } from "../../../types/WithTestID";
import { setAccessibilityFocus } from "../../../utils/accessibility";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";

type Props = WithTestID<{
  header?: React.ReactElement;
  content: React.ReactElement;
  footer?: React.ReactElement;
}>;

type DoubleFooterProps = {
  onPressLeft: () => void;
  onPressRight: () => void;
  titleLeft: string;
  titleRight: string;
};
type SingleFooterProps = {
  onPress: () => void;
  title: string;
};

const styles = StyleSheet.create({
  emptyHeader: {
    flex: 1,
    height: heightPercentageToDP("10%")
  },
  container: {
    position: "absolute",
    overflow: "hidden",
    bottom: 0,
    width: "100%"
  }
});

export const BaseSingleButtonFooter = ({
  onPress,
  title
}: SingleFooterProps) => {
  const safeAreaInsets = useSafeAreaInsets();
  return (
    <View
      style={[
        IOStyles.footer,
        styles.container,
        { paddingBottom: safeAreaInsets.bottom + IOStyles.footer.paddingBottom }
      ]}
    >
      <ButtonSolid fullWidth label={title} onPress={onPress} />
    </View>
  );
};

export const BaseDoubleButtonFooter = ({
  onPressLeft,
  onPressRight,
  titleLeft,
  titleRight
}: DoubleFooterProps) => {
  const safeAreaInsets = useSafeAreaInsets();
  return (
    <View
      style={[
        IOStyles.footer,
        IOStyles.row,
        styles.container,
        {
          paddingBottom: safeAreaInsets.bottom + IOStyles.footer.paddingBottom
        }
      ]}
    >
      <View style={IOStyles.flex}>
        <ButtonSolid fullWidth label={titleLeft} onPress={onPressLeft} />
      </View>
      <HSpacer size={8} />
      <View style={IOStyles.flex}>
        <ButtonSolid fullWidth label={titleRight} onPress={onPressRight} />
      </View>
    </View>
  );
};

export const BaseEuCovidCertificateLayout = (props: Props) => {
  const elementRef = useRef(null);

  const safeAreaInsets = useSafeAreaInsets();

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
      <ScrollView
        contentContainerStyle={{ paddingBottom: safeAreaInsets.bottom + 16 }}
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
    </>
  );
};
