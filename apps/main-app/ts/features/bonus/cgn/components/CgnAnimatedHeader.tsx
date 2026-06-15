import {
  Avatar,
  ContentWrapper,
  H3,
  hexToRgba,
  HSpacer,
  IOColors,
  VSpacer
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { Platform, StyleSheet, View } from "react-native";
import cgnLogo from "../../../../../img/bonus/cgn/cgn_logo.png";
import { CgnAnimatedBackground } from "./CgnAnimatedBackground";

type CgnAnimatedHeaderProps = {
  children?: React.ReactNode;
  ref?: React.Ref<View>;
};

const HEIGHT = Platform.select({ ios: 210, android: 185 });

const CgnAnimatedHeader = ({ children, ref }: CgnAnimatedHeaderProps) => (
  <View
    style={{ minHeight: HEIGHT, justifyContent: "flex-end" }}
    pointerEvents="box-none"
    ref={ref}
  >
    <View
      style={{
        position: "relative",
        height: HEIGHT,
        justifyContent: "flex-end"
      }}
      pointerEvents="box-none"
    >
      <View
        style={{ ...StyleSheet.absoluteFill, zIndex: 0 }}
        pointerEvents="none"
      >
        <CgnAnimatedBackground />
      </View>
      <ContentWrapper
        style={{
          paddingBottom: 24,
          zIndex: 1,
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: HEIGHT,
          justifyContent: "flex-end"
        }}
        pointerEvents="box-none"
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: hexToRgba(IOColors.white, 0.2),
              height: 66,
              width: 66,
              borderRadius: 8
            }}
          >
            <Avatar size="medium" logoUri={cgnLogo} />
          </View>
          <HSpacer size={16} />
          <View style={{ flex: 1 }}>
            <H3>{I18n.t("bonus.cgn.merchantsList.screenTitle")}</H3>
          </View>
        </View>
      </ContentWrapper>
    </View>
    <VSpacer size={16} />
    {children}
  </View>
);

export default CgnAnimatedHeader;
