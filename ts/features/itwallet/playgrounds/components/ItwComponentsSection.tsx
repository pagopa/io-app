import {
  Body,
  ClaimsSelector,
  ListItemHeader,
  ListItemSwitch,
  useIOTheme,
  useIOThemeContext,
  VStack
} from "@pagopa/io-app-design-system";
import { Canvas } from "@shopify/react-native-skia";
import I18n from "i18next";
import { useState } from "react";
import { Alert, useWindowDimensions, View } from "react-native";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { DSComponentViewerBox } from "../../../design-system/components/DSComponentViewerBox";
import { ItwBrandedBox } from "../../common/components/ItwBrandedBox";
import { ItwBrandedSkiaGradient } from "../../common/components/ItwBrandedSkiaGradient";
import { getCredentialCardConfig } from "../../common/components/ItwCredentialCard/config";
import { ItwEngagementBanner } from "../../common/components/ItwEngagementBanner";
import { ItwSkeumorphicCard } from "../../common/components/ItwSkeumorphicCard";
import { FlipGestureDetector } from "../../common/components/ItwSkeumorphicCard/FlipGestureDetector";
import { getCredentialStatusObject } from "../../common/utils/itwCredentialStatusUtils";
import { getCredentialNameFromType } from "../../common/utils/itwCredentialUtils";
import {
  CredentialType,
  ItwStoredCredentialsMocks
} from "../../common/utils/itwMocksUtils";
import { CredentialMetadata } from "../../common/utils/itwTypesUtils";
import { useItWalletTheme } from "../../common/utils/theme";
import { ItwRequestedClaimsList } from "../../issuance/components/ItwRequestedClaimsList";
import { ITW_ROUTES } from "../../navigation/routes";
import { ItwPresentationCredentialCardFlipButton } from "../../presentation/details/components/ItwPresentationCredentialCardFlipButton";

const ItwWalletBrandSection = () => {
  const { width } = useWindowDimensions();
  const marginHorizontal = 24;
  return (
    <View
      style={{
        marginHorizontal: -marginHorizontal,
        paddingHorizontal: marginHorizontal,
        paddingBottom: 24
      }}
    >
      <ListItemHeader label="IT-Wallet Gradient" />
      <VStack space={8}>
        {["default", "warning", "error"].map(variant => (
          <DSComponentViewerBox
            key={`itwallet-gradient-${variant}`}
            name={variant}
          >
            <Canvas
              key={variant}
              style={{ width: width - marginHorizontal * 2, height: 50 }}
            >
              <ItwBrandedSkiaGradient
                width={width - marginHorizontal * 2}
                height={50}
                variant={variant as any}
              />
            </Canvas>
          </DSComponentViewerBox>
        ))}
      </VStack>
      <ListItemHeader label="IT-Wallet Box" />
      <VStack space={8}>
        {["default", "warning", "error"].map(variant => (
          <DSComponentViewerBox key={`itwallet-box-${variant}`} name={variant}>
            <ItwBrandedBox variant={variant as any}>
              <Body>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua
              </Body>
            </ItwBrandedBox>
          </DSComponentViewerBox>
        ))}
      </VStack>
    </View>
  );
};

const ItwEngagementBannerSection = () => (
  <View
    style={{
      marginHorizontal: -24,
      paddingHorizontal: 24,
      paddingBottom: 24
    }}
  >
    <ListItemHeader label="IT-Wallet Engagement Banner" />
    <VStack space={8}>
      <DSComponentViewerBox name={"default"}>
        <ItwEngagementBanner
          title={"Porta su IO i tuoi documenti digitali"}
          description={
            "Con piena validità ufficiale, digitali e sempre a portata di mano!"
          }
          action={"Aggiungi un documento"}
          onPress={() => Alert.alert("✅ Engagement Banner pressed")}
          onDismiss={() => Alert.alert("❌ Engagement Banner dismissed")}
          dismissable={true}
        />
      </DSComponentViewerBox>
      <DSComponentViewerBox name={"link"}>
        <ItwEngagementBanner
          title={"Dimostra chi sei col tuo dispositivo"}
          description={
            "Usa la tua Patente digitale anche come documento di riconoscimento, in modo facile e sicuro!"
          }
          action={"Inizia"}
          onPress={() => Alert.alert("✅ Engagement Banner pressed")}
          onDismiss={() => Alert.alert("❌ Engagement Banner dismissed")}
          dismissable={true}
        />
      </DSComponentViewerBox>
    </VStack>
  </View>
);

const ItwSkeumorphicCredentialSection = () => {
  const [valuesHidden, setValuesHidden] = useState(false);

  const credentialsWithCard: ReadonlyArray<string> = [
    "mDL",
    "EuropeanDisabilityCard"
  ];

  const L2Credentials = Object.entries(ItwStoredCredentialsMocks)
    .filter(([key]) => key !== "L3")
    .map(([_, value]) => value as CredentialMetadata)
    .filter(({ credentialType }) =>
      credentialsWithCard.includes(credentialType)
    );
  return (
    <View>
      <ListItemHeader label="Skeumorphic credential card" />
      <ListItemSwitch
        label="Hide claim values"
        value={valuesHidden}
        onSwitchValueChange={() => {
          setValuesHidden(!valuesHidden);
        }}
      />
      <VStack space={16}>
        {L2Credentials.map(l2Credential => (
          <ItwSkeumorphicCredentialItem
            key={l2Credential.credentialType}
            credential={l2Credential}
            valuesHidden={valuesHidden}
          />
        ))}
      </VStack>
    </View>
  );
};

const ItwSkeumorphicCredentialItem = ({
  credential,
  valuesHidden
}: {
  credential: CredentialMetadata;
  valuesHidden: boolean;
}) => {
  const navigation = useIONavigation();
  const [isFlipped, setFlipped] = useState(false);
  const { status = "valid" } = getCredentialStatusObject(credential);

  const handleOnPress = () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.PRESENTATION.CREDENTIAL_CARD_MODAL,
      params: {
        credential,
        status
      }
    });
  };

  return (
    <VStack key={credential.credentialType} space={16}>
      <FlipGestureDetector isFlipped={isFlipped} setIsFlipped={setFlipped}>
        <ItwSkeumorphicCard
          credential={credential}
          status={status}
          isFlipped={isFlipped}
          onPress={handleOnPress}
          valuesHidden={valuesHidden}
        />
      </FlipGestureDetector>
      <ItwPresentationCredentialCardFlipButton
        isFlipped={isFlipped}
        handleOnPress={() => setFlipped(_ => !_)}
      />
    </VStack>
  );
};

export const ItwClaimsListSection = () => {
  const theme = useIOTheme();

  const mock = [
    {
      claim: { id: "firstName", label: "First Name", value: "Mario" },
      source: "CIE"
    },
    {
      claim: { id: "lastName", label: "Last Name", value: "Rossi" },
      source: "CIE"
    },
    {
      claim: { id: "dateOfBirth", label: "Date of Birth", value: "1990-01-01" },
      source: "CIE"
    },
    {
      claim: { id: "email", label: "Email", value: "mario.rossi@email.com" },
      source: "SPID"
    }
  ];

  return (
    <View
      style={{
        marginHorizontal: -24,
        paddingHorizontal: 24,
        paddingBottom: 24
      }}
    >
      <ListItemHeader
        label={I18n.t(
          "features.itWallet.issuance.credentialAuth.requiredClaims"
        )}
        iconName="security"
        iconColor={theme["icon-default"]}
      />
      <ItwRequestedClaimsList items={mock} />
    </View>
  );
};

const ItwClaimsSelectorSection = () => {
  const { themeType } = useIOThemeContext();
  const itwTheme = useItWalletTheme();

  return (
    <VStack space={8}>
      <ListItemHeader label="ClaimsSelector" />
      {[
        CredentialType.PID,
        CredentialType.DRIVING_LICENSE,
        CredentialType.EUROPEAN_DISABILITY_CARD,
        CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD,
        CredentialType.AGE_VERIFICATION,
        CredentialType.EDUCATION_ATTENDANCE,
        CredentialType.EDUCATION_DEGREE,
        CredentialType.EDUCATION_DIPLOMA,
        CredentialType.EDUCATION_ENROLLMENT,
        CredentialType.RESIDENCY,
        "Unknown Credential",
        "Unknown Credential Type with Ridicolously Long Long Long Long Name"
      ].map(credentialType => {
        const config = getCredentialCardConfig(credentialType, themeType);

        return (
          <ClaimsSelector
            key={credentialType}
            title={getCredentialNameFromType(credentialType, true)}
            items={[
              {
                id: "claim1",
                description: "Claim 1",
                value: "Value 1"
              },
              {
                id: "claim2",
                description: "Claim 2",
                value: "Value 2"
              }
            ]}
            defaultExpanded={false}
            selectionEnabled={false}
            headerGradientColors={[
              itwTheme["card-background"],
              config.background.colors[0]
            ]}
          />
        );
      })}
    </VStack>
  );
};

export const ItwComponentsSection = () => (
  <>
    <ItwWalletBrandSection />
    <ItwEngagementBannerSection />
    <ItwSkeumorphicCredentialSection />
    <ItwClaimsListSection />
    <ItwClaimsSelectorSection />
  </>
);
