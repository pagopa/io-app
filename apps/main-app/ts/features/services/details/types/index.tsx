import { CTA, CTAS } from "../../../../types/LocalizedCTAs";
import { CtaCategoryType } from "../../common/analytics";
import { ServiceKind } from "../components/ServiceDetailsScreenComponent";

/** Base type definition for all ServiceDetailsScreen components */
export type ServiceDetailsScreenBase = {
  children: React.ReactNode;
  ctas?: CTAS;
  onPressCta?: (cta: CTA, ctaCategoryType: CtaCategoryType) => void;
  title?: string;
};

/**
 * Type definition that describes additional information about the service,
 * specifying whether it is a special service, and if so, indicating the kind of
 * service
 */
export type ServiceMetadataInfo =
  | {
      isSpecialService: false;
      serviceKind?: never;
    }
  | {
      isSpecialService: true;
      serviceKind: NonNullable<ServiceKind>;
    };
