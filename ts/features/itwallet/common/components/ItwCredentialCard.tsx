import { HStack, IOColors, IOText, Tag } from "@pagopa/io-app-design-system";
import { ImageSourcePropType, StyleSheet, View } from "react-native";
import Color from "color";
import { AnimatedImage } from "../../../../components/AnimatedImage";
import {
  useBorderColorByStatus,
  getCredentialNameFromType,
  tagPropsByStatus,
  validCredentialStatuses
} from "../utils/itwCredentialUtils";
import { CredentialType } from "../utils/itwMocksUtils";
import { getThemeColorByCredentialType } from "../utils/itwStyleUtils";
import { ItwCredentialStatus } from "../utils/itwTypesUtils";
import {
  ItwDigitalVersionBadge,
  TagColorScheme
} from "./ItwDigitalVersionBadge";

export type ItwCredentialCard = {
  credentialType: string;
  status?: ItwCredentialStatus;
};

type StyleProps = {
  cardBackgroundSource: ImageSourcePropType;
  titleColor: string;
  titleOpacity: number;
  tagColorScheme: TagColorScheme;
};

const getStyleProps = (
  credentialType: string,
  status: ItwCredentialStatus
): StyleProps => {
  const isValid = validCredentialStatuses.includes(status);

  const theme = getThemeColorByCredentialType(credentialType);
  const [on, off, na] = credentialCardBackgrounds[credentialType];

  if (status === "unknown") {
    return {
      cardBackgroundSource: na,
      titleColor: Color(theme.textColor).grayscale().hex(),
      titleOpacity: 0.5,
      tagColorScheme: "greyscale"
    };
  }
  if (isValid) {
    return {
      cardBackgroundSource: on,
      titleColor: theme.textColor,
      titleOpacity: 1,
      tagColorScheme: "default"
    };
  }
  return {
    cardBackgroundSource: off,
    titleColor: theme.textColor,
    titleOpacity: 0.5,
    tagColorScheme: "faded"
  };
};

export const ItwCredentialCard = ({
  status = "valid",
  credentialType
}: ItwCredentialCard) => {
  const borderColorMap = useBorderColorByStatus();
  const styleProps = getStyleProps(credentialType, status);

  const statusTagProps = tagPropsByStatus[status];

  return (
    <View style={styles.cardContainer}>
      <View style={styles.card}>
        <AnimatedImage
          source={styleProps.cardBackgroundSource}
          style={styles.cardBackground}
        />
      </View>
      <View style={styles.header}>
        <HStack space={16}>
          <IOText
            size={16}
            lineHeight={20}
            font="TitilliumSansPro"
            weight="Semibold"
            maxFontSizeMultiplier={1.25}
            style={{
              letterSpacing: 0.25,
              color: styleProps.titleColor,
              opacity: styleProps.titleOpacity,
              flex: 1,
              flexShrink: 1
            }}
          >
            {getCredentialNameFromType(credentialType, "").toUpperCase()}
          </IOText>
          {statusTagProps && <Tag forceLightMode {...statusTagProps} />}
        </HStack>
      </View>
      <ItwDigitalVersionBadge
        credentialType={credentialType}
        colorScheme={styleProps.tagColorScheme}
      />
      <View style={[styles.border, { borderColor: borderColorMap[status] }]} />
    </View>
  );
};

const credentialCardBackgrounds: {
  [type: string]: [
    ImageSourcePropType,
    ImageSourcePropType,
    ImageSourcePropType
  ];
} = {
  [CredentialType.EUROPEAN_DISABILITY_CARD]: [
    require("../../../../../img/features/itWallet/cards/dc.png"),
    require("../../../../../img/features/itWallet/cards/dc_off.png"),
    require("../../../../../img/features/itWallet/cards/dc_na.png")
  ],
  [CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD]: [
    require("../../../../../img/features/itWallet/cards/ts.png"),
    require("../../../../../img/features/itWallet/cards/ts_off.png"),
    require("../../../../../img/features/itWallet/cards/ts_na.png")
  ],
  [CredentialType.DRIVING_LICENSE]: [
    require("../../../../../img/features/itWallet/cards/mdl.png"),
    require("../../../../../img/features/itWallet/cards/mdl_off.png"),
    require("../../../../../img/features/itWallet/cards/mdl_na.png")
  ]
};

const styles = StyleSheet.create({
  cardContainer: {
    aspectRatio: 16 / 10,
    borderRadius: 8,
    overflow: "hidden"
  },
  card: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: IOColors["grey-100"]
  },
  cardBackground: { height: "100%", width: "100%" },
  border: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 8,
    borderCurve: "continuous",
    borderWidth: 2
  },
  header: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 14
  }
});
