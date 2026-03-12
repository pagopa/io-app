import { useIOThemeContext } from "@pagopa/io-app-design-system";
import { Canvas } from "@shopify/react-native-skia";
import { PropsWithChildren, useState } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";
import { useThemeColorByCredentialType } from "../utils/itwStyleUtils";
import { ItwBrandedSkiaBorder } from "./ItwBrandedSkiaBorder";

type ItwCredentialDetailHeaderProps = PropsWithChildren<{
  credentialType: string;
}>;

const BORDER_RADIUS = 24;

export const ItwCredentialDetailHeader = ({
  credentialType,
  children
}: ItwCredentialDetailHeaderProps) => {
  const { backgroundColor } = useThemeColorByCredentialType(credentialType);
  const { themeType } = useIOThemeContext();
  const [size, setSize] = useState({ width: 0, height: 0 });

  const handleOnLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize({ width, height });
  };

  return (
    <View
      onLayout={handleOnLayout}
      style={[styles.container, { backgroundColor }]}
    >
      <Canvas
        style={{
          position: "absolute",
          width: size.width,
          height: size.height
        }}
      >
        <ItwBrandedSkiaBorder
          width={size.width}
          height={size.height}
          borderRadius={BORDER_RADIUS}
          themeType={themeType}
        />
      </Canvas>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS,
    borderCurve: "continuous",
    overflow: "hidden",
    marginHorizontal: 8,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: "center",
    gap: 8
  }
});
