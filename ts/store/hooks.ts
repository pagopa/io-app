import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../App";
import { GlobalState } from "./reducers/types";

export const useIODispatch = () => useDispatch<AppDispatch>();
export const useIOSelector: TypedUseSelectorHook<GlobalState> = useSelector;
