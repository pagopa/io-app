import { View } from "native-base";
import * as React from "react";
import { useRef } from "react";
import { Image, SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { NavigationEvents } from "react-navigation";
import { H1 } from "../../../components/core/typography/H1";
import { H2 } from "../../../components/core/typography/H2";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { WithTestID } from "../../../types/WithTestID";
import { setAccessibilityFocus } from "../../../utils/accessibility";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";
import SectionStatusComponent from "../../../components/SectionStatus";
import { WithCertificateHeaderData } from "../types/EUCovidCertificate";

type Props = WithTestID<
  {
    content: React.ReactElement;
    footer?: React.ReactElement;
  } & Partial<WithCertificateHeaderData>
>;

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between" },
  column: { flexDirection: "column", flex: 1 },
  euFlag: {
    width: 84,
    height: 84
  }
});

export const Header = (props: WithCertificateHeaderData) => (
  <>
    <View style={styles.row}>
      <View style={styles.column}>
        <H1 style={IOStyles.flex}>{props.headerData.title}</H1>
        <H2>{props.headerData.subTitle}</H2>
      </View>

      <Image
        source={{ uri: props.headerData.logoUrl }}
        style={styles.euFlag}
        importantForAccessibility={"no"}
        accessibilityElementsHidden={true}
      />
    </View>
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
          {props.headerData && <Header headerData={props.headerData} />}
          {props.content}
        </ScrollView>
        <SectionStatusComponent sectionKey={"euCovidCert"} />
        {props.footer}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
