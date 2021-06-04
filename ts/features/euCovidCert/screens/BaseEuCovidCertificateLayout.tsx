import { View } from "native-base";
import * as React from "react";
import { useRef } from "react";
import { Image, SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { NavigationEvents } from "react-navigation";
import image from "../../../../img/features/euCovidCert/eu-flag.png";
import { H1 } from "../../../components/core/typography/H1";
import { H2 } from "../../../components/core/typography/H2";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import I18n from "../../../i18n";
import { WithTestID } from "../../../types/WithTestID";
import { setAccessibilityFocus } from "../../../utils/accessibility";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";

type Props = WithTestID<{
  content: React.ReactElement;
  footer?: React.ReactElement;
}>;

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between" },
  euFlag: {
    width: 84,
    height: 56,
    flex: 0
  }
});

const Header = React.forwardRef<View>((_, ref) => (
  <>
    <View style={styles.row} ref={ref}>
      <H1 style={IOStyles.flex}>
        {I18n.t("features.euCovidCertificate.common.title")}
      </H1>
      <Image source={image} style={styles.euFlag} />
    </View>
    <H2>{I18n.t("features.euCovidCertificate.common.subtitle")}</H2>
  </>
));

export const BaseEuCovidCertificateLayout = (props: Props) => {
  const elementRef = useRef<View>(null);
  return (
    <BaseScreenComponent goBack={true} contextualHelp={emptyContextualHelp}>
      <NavigationEvents onDidFocus={() => setAccessibilityFocus(elementRef)} />
      <SafeAreaView
        style={IOStyles.flex}
        testID={"BaseEuCovidCertificateLayout"}
      >
        <ScrollView style={[IOStyles.horizontalContentPadding]}>
          <Header ref={elementRef} />
          {props.content}
        </ScrollView>
        {props.footer}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
