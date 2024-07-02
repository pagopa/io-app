export type ServiceMetadataInfo =
  | {
      isSpecialService: true;
      customSpecialFlow: string;
    }
  | {
      isSpecialService: false;
      customSpecialFlow?: never;
    };
