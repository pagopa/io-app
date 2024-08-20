import { ParsedCredential } from "../../../utils/itwTypesUtils";
import { CardSide } from "../types";
import { MdlBackData, MdlFrontData } from "./mdl";

export type DataComponentProps = {
  claims: ParsedCredential;
};

export const dataComponentMap: Record<
  string,
  Record<CardSide, React.ElementType<DataComponentProps>>
> = {
  MDL: { front: MdlFrontData, back: MdlBackData }
};
