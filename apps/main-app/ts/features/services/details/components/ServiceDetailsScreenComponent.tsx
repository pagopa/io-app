import { ServiceDetailsScreenCdc } from "./ServiceDetailsScreenCdc";
import {
  ServiceDetailsScreenCgn,
  ServiceDetailsScreenCgnProps
} from "./ServiceDetailsScreenCgn";
import {
  ServiceDetailsScreenDefault,
  ServiceDetailsScreenDefaultProps
} from "./ServiceDetailsScreenDefault";
import {
  ServiceDetailsScreenPn,
  ServiceDetailsScreenPnProps
} from "./ServiceDetailsScreenPn";

export type ServiceDetailsScreenComponent =
  | ServiceDetailsScreenCdc
  | ServiceDetailsScreenCgn
  | ServiceDetailsScreenDefault
  | ServiceDetailsScreenPn;

export type ServiceKind = ServiceDetailsScreenComponent["kind"];

type ServiceDetailsScreenCdc = ServiceDetailsScreenCgnProps & {
  kind: "cdc";
};

type ServiceDetailsScreenCgn = ServiceDetailsScreenCgnProps & {
  kind: "cgn";
};

type ServiceDetailsScreenDefault = ServiceDetailsScreenDefaultProps & {
  kind?: "default";
};

type ServiceDetailsScreenPn = ServiceDetailsScreenPnProps & {
  kind: "pn";
};

/**
 * This component renders different types of service
 * details screens based on the kind
 */
export const ServiceDetailsScreenComponent = ({
  children,
  ...rest
}: ServiceDetailsScreenComponent) => {
  switch (rest.kind) {
    case "cdc":
      return (
        <ServiceDetailsScreenCdc {...rest}>{children}</ServiceDetailsScreenCdc>
      );
    case "cgn":
      return (
        <ServiceDetailsScreenCgn {...rest}>{children}</ServiceDetailsScreenCgn>
      );
    case "pn":
      return (
        <ServiceDetailsScreenPn {...rest}>{children}</ServiceDetailsScreenPn>
      );
    default:
      return (
        <ServiceDetailsScreenDefault {...rest}>
          {children}
        </ServiceDetailsScreenDefault>
      );
  }
};
