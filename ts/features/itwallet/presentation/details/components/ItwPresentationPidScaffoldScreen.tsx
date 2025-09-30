import { StyleSheet, View } from "react-native";
import {
  ContentWrapper,
  VStack,
  H2,
  VSpacer,
  Body,
  IOAppMargin
} from "@pagopa/io-app-design-system";
import { memo, PropsWithChildren, useState } from "react";
import { Canvas, Rect, vec, LinearGradient } from "@shopify/react-native-skia";
import I18n from "i18next";
import FocusAwareStatusBar from "../../../../../components/ui/FocusAwareStatusBar";
import {
  IT_WALLET_ID_BG,
  IT_WALLET_ID_BG_LIGHT
} from "../../../common/utils/constants";
import { StoredCredential } from "../../../common/utils/itwTypesUtils";
import { ItwPresentationDetailsScreenBase } from "./ItwPresentationDetailsScreenBase";

type Props = {
  credential: StoredCredential;
};

export const ItwPresentationPidScaffoldScreen = ({
  credential,
  children
}: PropsWithChildren<Props>) => (
  <ItwPresentationDetailsScreenBase credential={credential}>
    <FocusAwareStatusBar backgroundColor={IT_WALLET_ID_BG_LIGHT} />
    <ScreenHeader />
    <VSpacer />
    <ContentWrapper>{children}</ContentWrapper>
  </ItwPresentationDetailsScreenBase>
);

const ScreenHeader = memo(() => (
  <View style={styles.header}>
    <BackgroundGradient />
    <ContentWrapper>
      <VStack space={16}>
        <H2>{I18n.t("features.itWallet.credentialName.pid")}</H2>
        <Body color="black">
          {I18n.t("features.itWallet.presentation.itWalletId.description")}
        </Body>
      </VStack>
    </ContentWrapper>
  </View>
));

const BackgroundGradient = () => {
  const [{ width, height }, setDimensions] = useState({ width: 0, height: 0 });

  return (
    <View
      style={StyleSheet.absoluteFill}
      onLayout={event => {
        setDimensions({
          width: event.nativeEvent.layout.width,
          height: event.nativeEvent.layout.height
        });
      }}
    >
      <Canvas style={StyleSheet.absoluteFill}>
        <Rect x={0} y={0} width={width} height={height}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, height)}
            colors={[IT_WALLET_ID_BG_LIGHT, IT_WALLET_ID_BG]}
          />
        </Rect>
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingBottom: IOAppMargin[1]
  }
});
