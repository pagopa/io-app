import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../App";

export const useIODispatch = () => useDispatch<AppDispatch>();
export const useIOSelector: TypedUseSelectorHook<RootState> = useSelector;
