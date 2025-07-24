import {
  ContentWrapper,
  H1,
  IOSkeleton,
  VSpacer,
  VStack
} from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { Image } from "react-native";
import { InitiativeDataDTO } from "../../../../../definitions/idpay/InitiativeDataDTO";

type Props = {
  initiative: O.Option<InitiativeDataDTO>;
};

const IdPayOnboardingServiceHeader = (props: Props) => {
  const { initiative } = props;

  return pipe(
    initiative,
    O.map(initiativeDetails => ({
      organizationName: initiativeDetails.organizationName,
      initiativeName: initiativeDetails.initiativeName,
      logoURL: initiativeDetails.logoURL
    })),
    O.fold(
      () => <Skeleton />,
      ({ initiativeName, logoURL }) => (
        <VStack>
          <Image
            accessibilityIgnoresInvertColors
            style={{
              width: "100%",
              height: 270,
              flex: 1
            }}
            source={{ uri: logoURL }}
          />
          <ContentWrapper>
            <VSpacer size={24} />
            <H1>{initiativeName}</H1>
          </ContentWrapper>
        </VStack>
      )
    )
  );
};

const Skeleton = () => (
  <VStack>
    <IOSkeleton shape="rectangle" height={270} width="auto" />
    <ContentWrapper>
      <VSpacer size={24} />
      <IOSkeleton shape="rectangle" width="80%" height={16} radius={4} />
    </ContentWrapper>
  </VStack>
);

export { IdPayOnboardingServiceHeader };
