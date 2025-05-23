import {
  BodySmall,
  H6,
  HSpacer,
  IOColors,
  VSpacer,
  hexToRgba
} from "@pagopa/io-app-design-system";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import {
  Image,
  ImageBackground,
  Platform,
  StyleSheet,
  View
} from "react-native";
import walletCardBg from "../../../../../img/features/idpay/wallet_card.png";
import TouchableDefaultOpacity from "../../../../components/TouchableDefaultOpacity";
import { formatNumberCentsToAmount } from "../../../../utils/stringBuilder";

type Props = {
  initiativeName?: string;
  logoUrl?: string;
  availableAmount?: number;
  onPress?: () => void;
};

const formatNumberRightSign = (amount: number) =>
  `${formatNumberCentsToAmount(amount, false)} €`;

const IDPayCardPreviewComponent = (props: Props) => {
  const { initiativeName, logoUrl, onPress } = props;

  const availableAmount = pipe(
    props.availableAmount,
    O.fromNullable,
    O.map(formatNumberRightSign),
    O.getOrElse(() => "-")
  );

  const logoComponent = pipe(
    NonEmptyString.decode(logoUrl),
    O.fromEither,
    O.fold(
      () => undefined,
      logoUrl => (
        <Image
          accessibilityIgnoresInvertColors
          source={{ uri: logoUrl }}
          style={styles.initiativeLogo}
        />
      )
    )
  );

  return (
    <>
      {Platform.OS === "android" && (
        <View
          style={styles.upperShadowBox}
          accessible={false}
          importantForAccessibility={"no"}
          accessibilityElementsHidden={true}
        />
      )}
      <ImageBackground
        source={walletCardBg}
        style={[styles.card, Platform.OS === "ios" ? styles.cardShadow : {}]}
        imageStyle={styles.cardImage}
      >
        <TouchableDefaultOpacity
          style={styles.cardContent}
          onPress={onPress}
          accessible={true}
          accessibilityRole={"button"}
        >
          <View style={{ flex: 1, flexDirection: "row" }}>
            <H6 style={{ flex: 1 }} ellipsizeMode="tail" numberOfLines={1}>
              {initiativeName}
            </H6>
            <HSpacer size={8} />
            <BodySmall weight="Semibold" color="black" ellipsizeMode={"tail"}>
              {availableAmount}
            </BodySmall>
          </View>
          {logoComponent}
        </TouchableDefaultOpacity>
        <VSpacer size={16} />
      </ImageBackground>
    </>
  );
};

const opaqueBorderColor = hexToRgba(IOColors.black, 0.1);

const styles = StyleSheet.create({
  upperShadowBox: {
    marginBottom: -13,
    borderRadius: 8,
    borderTopWidth: 13,
    borderTopColor: opaqueBorderColor,
    height: 17,
    width: "100%"
  },
  card: {
    marginBottom: -20,
    height: 88,
    marginLeft: 0,
    marginRight: 0
  },
  cardShadow: {
    shadowOffset: {
      width: 0,
      height: 3
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    borderRadius: 8,
    zIndex: -7,
    elevation: -7
  },
  cardImage: {
    resizeMode: "stretch",
    height: 88,
    width: "100%"
  },
  cardContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 16,
    paddingRight: 24
  },
  initiativeLogo: {
    resizeMode: "cover",
    backgroundColor: IOColors.white,
    height: 32,
    width: 32,
    borderRadius: 4,
    marginLeft: 8
  }
});

export default IDPayCardPreviewComponent;
