import {
  ContentWrapper,
  HStack,
  IOVisualCostants,
  TabItem,
  TabNavigation,
  VSpacer,
  VStack
} from "@pagopa/io-app-design-system";
import { useState } from "react";
import { Alert, Pressable, ScrollView } from "react-native";
import { CgnCard } from "../../bonus/cgn/components/CgnCard";
import { IdPayCard } from "../../idpay/wallet/components/IdPayCard";
import { ItwCredentialCard } from "../../itwallet/common/components/ItwCredentialCard";
import {
  ItwSkeumorphicCard,
  ItwSkeumorphicCardProps
} from "../../itwallet/common/components/ItwSkeumorphicCard";
import {
  CredentialType,
  ItwStoredCredentialsMocks
} from "../../itwallet/common/utils/itwMocksUtils";
import { PaymentCard } from "../../payments/common/components/PaymentCard";
import { PaymentCardSmall } from "../../payments/common/components/PaymentCardSmall";
import {
  PaymentCardsCarousel,
  PaymentCardsCarouselProps,
  PaymentCardsCarouselSkeleton
} from "../../payments/home/components/PaymentsCardsCarousel";
import {
  FeaturedInstitutionsCarousel,
  FeaturedInstitutionsCarouselProps,
  FeaturedInstitutionsCarouselSkeleton
} from "../../services/home/components/FeaturedInstitutionsCarousel";
import {
  FeaturedServicesCarousel,
  FeaturedServicesCarouselProps,
  FeaturedServicesCarouselSkeleton
} from "../../services/home/components/FeaturedServicesCarousel";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";
import { DesignSystemScreen } from "../components/DesignSystemScreen";
import { DesignSystemSection } from "../components/DesignSystemSection";

const onPress = () => {
  Alert.alert("Alert", "Action triggered");
};

const expiredDate = new Date(new Date().getTime() - 10000 * 60 * 10 * 24 * 30);
const validDate = new Date(new Date().getTime() + 10000 * 60 * 10 * 24 * 30);

const cardsDataForCarousel: PaymentCardsCarouselProps = {
  cards: [
    {
      hpan: "9999",
      expireDate: validDate,
      brand: "maestro",
      onPress
    },
    {
      holderEmail: "test@test.it",
      expireDate: validDate,
      onPress
    },
    {
      holderPhone: "1234",
      onPress
    },
    {
      hpan: "9999",
      expireDate: validDate,
      brand: "",
      onPress
    },
    {
      hpan: "9999",
      expireDate: expiredDate,
      isExpired: true,
      brand: "maestro",
      onPress
    },
    {
      holderEmail: "test@test.it",
      expireDate: expiredDate,
      isExpired: true,
      onPress
    }
  ]
};

const featuredInstitutionsDataForCarousel: FeaturedInstitutionsCarouselProps = {
  institutions: [
    {
      id: "anInstitutionId1",
      name: "Motorizzazione",
      onPress
    },
    {
      id: "anInstitutionId2",
      name: "IO - L'app dei servizi pubblici",
      isNew: true,
      onPress
    },
    {
      id: "anInstitutionId3",
      name: "PCM - Dipartimento per le Politiche Giovanili e il Servizio Civile Universale",
      onPress
    }
  ]
};

const featuredServicesDataForCarousel: FeaturedServicesCarouselProps = {
  services: [
    {
      id: "aServiceId1a",
      name: "Service Name",
      onPress
    },
    {
      id: "aServiceId1b",
      name: "Service Name",
      organizationName: "Organization Name",
      isNew: true,
      onPress
    },
    {
      id: "aServiceId2a",
      name: "Service Name without org. name",
      onPress
    },
    {
      id: "aServiceId2b",
      name: "Service Name on two lines",
      organizationName: "Organization Name",
      isNew: true,
      onPress
    },
    {
      id: "aServiceId3a",
      name: "Verbose Service Name on three lines",
      onPress
    },
    {
      id: "aServiceId3b",
      name: "Verbose Service Name on three lines",
      organizationName: "Verbose Organization Name",
      isNew: true,
      onPress
    },
    {
      id: "aServiceId4a",
      name: "Very long Service Name that exceeds the space allowed",
      isNew: true,
      onPress
    },
    {
      id: "aServiceId4b",
      name: "Very long Service Name that exceeds the space allowed",
      organizationName: "Verbose Organization Name",
      onPress
    }
  ]
};

const cardHorizontalScrollGap = 16;
const cardHorizontalScrollGapSmall = 8;
const componentMargin = 32;
const blockMargin = 48;

const PaymentCards = () => (
  <VStack space={blockMargin}>
    <DesignSystemSection title="PaymentCard">
      <VStack space={componentMargin}>
        <DSComponentViewerBox name="PaymentCard">
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            style={{
              aspectRatio: 16 / 9,
              marginHorizontal: -IOVisualCostants.appMarginDefault
            }}
            contentContainerStyle={{
              paddingHorizontal: IOVisualCostants.appMarginDefault
            }}
          >
            <HStack space={cardHorizontalScrollGap}>
              <PaymentCard
                brand="MASTERCARD"
                hpan="9900"
                expireDate={validDate}
              />
              <PaymentCard
                holderEmail="anna_v********@**hoo.it"
                expireDate={validDate}
              />
              <PaymentCard
                brand="MASTERCARD"
                hpan="9900"
                expireDate={expiredDate}
                isExpired={true}
              />
              <PaymentCard
                holderEmail="anna_v********@**hoo.it"
                expireDate={expiredDate}
                isExpired={true}
              />
              <PaymentCard isLoading />
            </HStack>
          </ScrollView>
        </DSComponentViewerBox>
      </VStack>
    </DesignSystemSection>
    <DesignSystemSection title="PaymentCardSmall">
      <VStack space={componentMargin}>
        <DSComponentViewerBox name="Credit card · Active and expired">
          <HStack space={cardHorizontalScrollGapSmall}>
            <PaymentCardSmall hpan="9900" brand="maestro" onPress={onPress} />
            <PaymentCardSmall
              hpan="9900"
              brand="maestro"
              expireDate={new Date(2021, 10)}
              isExpired
            />
          </HStack>
        </DSComponentViewerBox>
        <DSComponentViewerBox name="PagoBANCOMAT · Active and without bankName">
          <HStack space={cardHorizontalScrollGapSmall}>
            <PaymentCardSmall
              brand="pagoBancomat"
              bankName="Intesa San Paolo"
              onPress={onPress}
            />
            <PaymentCardSmall />
          </HStack>
        </DSComponentViewerBox>
        <DSComponentViewerBox name="PayPal · Active and expired">
          <HStack space={cardHorizontalScrollGapSmall}>
            <PaymentCardSmall
              holderEmail="anna_v********@**hoo.it"
              onPress={onPress}
            />
            <PaymentCardSmall
              holderEmail="anna_v********@**hoo.it"
              expireDate={new Date(2021, 10)}
              isExpired={true}
            />
          </HStack>
        </DSComponentViewerBox>
        <DSComponentViewerBox name="Co-badge · Active and expired">
          <HStack space={cardHorizontalScrollGapSmall}>
            <PaymentCardSmall
              bankName="Intesa San Paolo"
              brand="maestro"
              onPress={onPress}
            />
            <PaymentCardSmall
              bankName="Intesa San Paolo"
              brand="maestro"
              expireDate={new Date(2021, 10)}
              isExpired
            />
          </HStack>
        </DSComponentViewerBox>
        <DSComponentViewerBox name="BANCOMAT Pay · Active and expired">
          <HStack space={cardHorizontalScrollGapSmall}>
            <PaymentCardSmall
              holderName="Anna Verdi"
              holderPhone="+39 340 *** **62"
              onPress={onPress}
            />
            <PaymentCardSmall
              holderName="Anna Verdi"
              holderPhone="+39 340 *** **62"
              expireDate={new Date(2021, 10)}
              isExpired
            />
          </HStack>
        </DSComponentViewerBox>
        <DSComponentViewerBox name="PaymentCardsCarousel">
          <PaymentCardsCarousel {...cardsDataForCarousel} />
        </DSComponentViewerBox>
        <DSComponentViewerBox name="PaymentCardsCarouselSkeleton">
          <PaymentCardsCarouselSkeleton />
        </DSComponentViewerBox>
      </VStack>
    </DesignSystemSection>
  </VStack>
);

const BonusCards = () => (
  <VStack space={blockMargin}>
    <DesignSystemSection title="IdPayCard">
      <IdPayCard
        name="18 app"
        amount={9999}
        avatarSource={{
          uri: "https://vtlogo.com/wp-content/uploads/2021/08/18app-vector-logo.png"
        }}
        expireDate={new Date()}
      />
    </DesignSystemSection>
    <DesignSystemSection title="CgnCard">
      <VStack space={componentMargin}>
        <DSComponentViewerBox name="Under 31">
          <CgnCard expireDate={new Date(2023, 11, 2)} withEycaLogo={true} />
        </DSComponentViewerBox>
        <DSComponentViewerBox name="Expired">
          <CgnCard withEycaLogo={true} />
        </DSComponentViewerBox>
        <DSComponentViewerBox name="Over 31">
          <CgnCard expireDate={new Date(2023, 11, 2)} />
        </DSComponentViewerBox>
      </VStack>
    </DesignSystemSection>
  </VStack>
);

const ServicesCards = () => (
  <VStack space={blockMargin}>
    <DesignSystemSection title="InstitutionCard">
      <VStack space={componentMargin}>
        <DSComponentViewerBox name="InstitutionCardsCarousel">
          <FeaturedInstitutionsCarousel
            {...featuredInstitutionsDataForCarousel}
          />
        </DSComponentViewerBox>
        <DSComponentViewerBox name="InstitutionCardsCarouselSkeleton">
          <FeaturedInstitutionsCarouselSkeleton />
        </DSComponentViewerBox>
      </VStack>
    </DesignSystemSection>
    <DesignSystemSection title="ServiceCard">
      <VStack space={componentMargin}>
        <DSComponentViewerBox name="ServiceCardsCarousel">
          <FeaturedServicesCarousel {...featuredServicesDataForCarousel} />
        </DSComponentViewerBox>
        <DSComponentViewerBox name="ServiceCardsCarouselSkeleton">
          <FeaturedServicesCarouselSkeleton />
        </DSComponentViewerBox>
      </VStack>
    </DesignSystemSection>
  </VStack>
);

const ItwCards = () => (
  <VStack space={blockMargin}>
    <DesignSystemSection title="Driving License">
      <VStack space={componentMargin}>
        <DSComponentViewerBox name="Valid">
          <ItwCredentialCard credentialType={CredentialType.DRIVING_LICENSE} />
        </DSComponentViewerBox>
        <DSComponentViewerBox name="Invalid">
          <ItwCredentialCard
            credentialType={CredentialType.DRIVING_LICENSE}
            credentialStatus="invalid"
          />
        </DSComponentViewerBox>
        <DSComponentViewerBox name="Expired">
          <ItwCredentialCard
            credentialType={CredentialType.DRIVING_LICENSE}
            credentialStatus="expired"
          />
        </DSComponentViewerBox>
        <DSComponentViewerBox name="Expiring">
          <ItwCredentialCard
            credentialType={CredentialType.DRIVING_LICENSE}
            credentialStatus="expiring"
          />
        </DSComponentViewerBox>
        <DSComponentViewerBox name="Expired Digital Credential">
          <ItwCredentialCard
            credentialType={CredentialType.DRIVING_LICENSE}
            credentialStatus="jwtExpired"
          />
        </DSComponentViewerBox>
        <DSComponentViewerBox name="Expiring Digital Credential">
          <ItwCredentialCard
            credentialType={CredentialType.DRIVING_LICENSE}
            credentialStatus="jwtExpiring"
          />
        </DSComponentViewerBox>
        <DSComponentViewerBox name="Unknown Status">
          <ItwCredentialCard
            credentialType={CredentialType.DRIVING_LICENSE}
            credentialStatus="unknown"
          />
        </DSComponentViewerBox>
      </VStack>
    </DesignSystemSection>
    <DesignSystemSection title="Skeumorphic Driving License">
      <VStack space={componentMargin}>
        <DSComponentViewerBox name="Valid">
          <ItwSkeumorphicCardPreview
            credential={ItwStoredCredentialsMocks.mdl}
            status="valid"
            valuesHidden={false}
          />
        </DSComponentViewerBox>
      </VStack>
    </DesignSystemSection>
    <DesignSystemSection title="Disability Card">
      <VStack space={componentMargin}>
        <DSComponentViewerBox name="Valid">
          <ItwCredentialCard
            credentialType={CredentialType.EUROPEAN_DISABILITY_CARD}
          />
        </DSComponentViewerBox>
        <DSComponentViewerBox name="Expired">
          <ItwCredentialCard
            credentialType={CredentialType.EUROPEAN_DISABILITY_CARD}
            credentialStatus="expired"
          />
        </DSComponentViewerBox>
        <DSComponentViewerBox name="Expiring">
          <ItwCredentialCard
            credentialType={CredentialType.EUROPEAN_DISABILITY_CARD}
            credentialStatus="expiring"
          />
        </DSComponentViewerBox>
        <DSComponentViewerBox name="Unknown Status">
          <ItwCredentialCard
            credentialType={CredentialType.EUROPEAN_DISABILITY_CARD}
            credentialStatus="unknown"
          />
        </DSComponentViewerBox>
      </VStack>
    </DesignSystemSection>
    <DesignSystemSection title="Skeumorphic Disability Card">
      <VStack space={componentMargin}>
        <DSComponentViewerBox name="Valid">
          <ItwSkeumorphicCardPreview
            credential={ItwStoredCredentialsMocks.dc}
            status="valid"
            valuesHidden={false}
          />
        </DSComponentViewerBox>
      </VStack>
    </DesignSystemSection>
    <DesignSystemSection title="Health Insurance Card">
      <VStack space={componentMargin}>
        <DSComponentViewerBox name="Valid">
          <ItwCredentialCard
            credentialType={CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD}
          />
        </DSComponentViewerBox>
        <DSComponentViewerBox name="Expired">
          <ItwCredentialCard
            credentialType={CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD}
            credentialStatus="expired"
          />
        </DSComponentViewerBox>
        <DSComponentViewerBox name="Expiring">
          <ItwCredentialCard
            credentialType={CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD}
            credentialStatus="expiring"
          />
        </DSComponentViewerBox>
        <DSComponentViewerBox name="Unknown Status">
          <ItwCredentialCard
            credentialType={CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD}
            credentialStatus="unknown"
          />
        </DSComponentViewerBox>
      </VStack>
    </DesignSystemSection>
    <DesignSystemSection title="Education Degree (Gradient Background)">
      <VStack space={componentMargin}>
        <DSComponentViewerBox name="ITW Credential">
          <ItwCredentialCard credentialType={CredentialType.EDUCATION_DEGREE} />
        </DSComponentViewerBox>
        <DSComponentViewerBox name="ITW Multi level Credential">
          <ItwCredentialCard
            credentialType={CredentialType.EDUCATION_DEGREE}
            isMultiCredential={true}
          />
        </DSComponentViewerBox>
      </VStack>
    </DesignSystemSection>
    <DesignSystemSection title="Education Enrollment (Gradient Background)">
      <VStack space={componentMargin}>
        <DSComponentViewerBox name="ITW Credential">
          <ItwCredentialCard
            credentialType={CredentialType.EDUCATION_ENROLLMENT}
          />
        </DSComponentViewerBox>
        <DSComponentViewerBox name="ITW Multi level Credential">
          <ItwCredentialCard
            credentialType={CredentialType.EDUCATION_ENROLLMENT}
            isMultiCredential={true}
          />
        </DSComponentViewerBox>
      </VStack>
    </DesignSystemSection>
  </VStack>
);

const ItwSkeumorphicCardPreview = (props: ItwSkeumorphicCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  return (
    <Pressable
      onPress={() => setIsFlipped(!isFlipped)}
      accessibilityRole="button"
      accessibilityLabel="Flip card"
    >
      <ItwSkeumorphicCard {...props} isFlipped={isFlipped} />
    </Pressable>
  );
};

// for testing reasons, abi codes can be found here:
// https://www.comuniecitta.it/elenco-banche-per-codice-abi
export const DSCards = () => {
  const [page, setPage] = useState(0);

  return (
    <DesignSystemScreen title={"Cards"} noMargin={true}>
      <TabNavigation
        tabAlignment="start"
        selectedIndex={page}
        onItemPress={setPage}
      >
        <TabItem label="Payments" accessibilityLabel="Payments" />
        <TabItem label="Bonus" accessibilityLabel="Bonus" />
        <TabItem label="Services" accessibilityLabel="Services" />
        <TabItem label="Documenti" accessibilityLabel="Documenti" />
      </TabNavigation>
      <VSpacer size={24} />
      <ContentWrapper>
        {page === 0 && <PaymentCards />}
        {page === 1 && <BonusCards />}
        {page === 2 && <ServicesCards />}
        {page === 3 && <ItwCards />}
      </ContentWrapper>
    </DesignSystemScreen>
  );
};
