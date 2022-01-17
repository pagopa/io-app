import * as React from "react";
import { useRef } from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { NavigationEvents } from "react-navigation";
import { Image, StyleSheet } from "react-native";
import { View } from "native-base";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { WithTestID } from "../../../types/WithTestID";
import { setAccessibilityFocus } from "../../../utils/accessibility";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";
import SectionStatusComponent from "../../../components/SectionStatus";
import { H1 } from "../../../components/core/typography/H1";
import { H2 } from "../../../components/core/typography/H2";
import I18n from "../../../i18n";
import image from "../../../../img/features/euCovidCert/eu-flag.png";

type Props = WithTestID<{
  header?: React.ReactElement;
  content: React.ReactElement;
  footer?: React.ReactElement;
}>;

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between" },
  column: { flexDirection: "column", flex: 1 },
  euFlag: {
    width: 84,
    height: 84
  }
});

/**
 * header with fixed title/subtitle/image
 * @constructor
 */
export const FallbackHeader = () => (
  <>
    <View style={styles.row}>
      <H1 style={IOStyles.flex}>
        {I18n.t("features.euCovidCertificate.common.title")}
      </H1>
      <Image
        source={image}
        style={styles.euFlag}
        importantForAccessibility={"no"}
        accessibilityElementsHidden={true}
      />
    </View>
    <H2>{I18n.t("features.euCovidCertificate.common.subtitle")}</H2>
  </>
);

export const BaseEuCovidCertificateLayout = (props: Props) => {
  const elementRef = useRef(null);
  return (
    <BaseScreenComponent
      goBack={true}
      contextualHelp={emptyContextualHelp}
      shouldAskForScreenshotWithInitialValue={false}
    >
      <NavigationEvents onDidFocus={() => setAccessibilityFocus(elementRef)} />
      <SafeAreaView
        style={IOStyles.flex}
        testID={"BaseEuCovidCertificateLayout"}
        ref={elementRef}
      >
        <ScrollView
          style={[IOStyles.horizontalContentPadding]}
          testID={props.testID}
        >
          {props.header ?? <FallbackHeader />}
          {props.content}
        </ScrollView>
        <SectionStatusComponent sectionKey={"euCovidCert"} />
        {props.footer}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
