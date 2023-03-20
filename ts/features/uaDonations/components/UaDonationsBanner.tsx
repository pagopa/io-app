import { useLinkTo } from "@react-navigation/native";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import {
  View,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback
} from "react-native";
import Heart from "../../../../img/features/uaDonations/heart.svg";
import { H5 } from "../../../components/core/typography/H5";
import { IOColors } from "../../../components/core/variables/IOColors";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { mixpanelTrack } from "../../../mixpanel";
import { useIOSelector } from "../../../store/hooks";
import { uaDonationsBannerSelector } from "../../../store/reducers/backendStatus";
import { getFullLocale } from "../../../utils/locale";

const styles = StyleSheet.create({
  background: {
    backgroundColor: IOColors.blue,
    marginTop: 24,
    // on iOS, we can fit the original design with more precision
    marginHorizontal: Platform.OS === "ios" ? -8 : 0,
    padding: 16,
    borderRadius: 16
  },
  row: { flexDirection: "row", alignItems: "center" },
  text: {
    flex: 1,
    paddingRight: 16
  }
});

const iconSize = 48;

type BaseProps = {
  text: string;
  onPress?: React.ComponentProps<typeof TouchableWithoutFeedback>["onPress"];
};

/**
 * The base graphical component, take a text as input and dispatch onPress when pressed
 * @param props
 * @constructor
 */
const BaseDonationsBanner = (props: BaseProps): React.ReactElement => (
  <TouchableWithoutFeedback
    onPress={props.onPress}
    accessible={true}
    accessibilityRole={"button"}
  >
    <View style={styles.background} testID={"UaDonationsBanner"}>
      <View style={styles.row}>
        <H5 color={"white"} weight={"Regular"} style={styles.text}>
          {props.text}
        </H5>
        <Heart
          width={iconSize}
          height={iconSize}
          fill={IOColors.white}
          style={IOStyles.flex}
        />
      </View>
    </View>
  </TouchableWithoutFeedback>
);

/**
 * Render a banner using a remote text and a 💙 icon.
 * Tap on this banner generate a navigation to the donation screen.
 * This component is visible only if:
 * local feature flag === true && remote feature flag === true && remote banner visible === true
 * && the locale text is not an empty string
 * @constructor
 */
export const UaDonationsBanner = () => {
  const locale = getFullLocale();
  const uaDonationsBannerData = useIOSelector(state =>
    uaDonationsBannerSelector(state, locale)
  );

  const linkTo = useLinkTo();

  return pipe(
    uaDonationsBannerData,
    O.fold(
      () => null,
      uaDonationsData => (
        <BaseDonationsBanner
          text={uaDonationsData.description[locale]}
          onPress={() => {
            void mixpanelTrack("UADONATIONS_BANNER_HANDLER_SUCCESS");
            linkTo(`/uadonations-webview?urlToLoad=${uaDonationsData.url}`);
          }}
        />
      )
    )
  );
};
