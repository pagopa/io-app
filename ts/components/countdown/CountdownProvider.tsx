import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useRef,
  useEffect
} from "react";

type CountdownContextType = {
  timerCount: number;
  resetTimer?: () => void;
  startTimer?: () => void;
  isRunning?: () => boolean;
};

const CountdownContext = createContext<CountdownContextType>({ timerCount: 0 });

// Props type for the provider component
interface CountdownProviderProps {
  children: ReactNode;
  timerTiming: number;
  intervalDuration: number;
}

export const CountdownProvider = (props: CountdownProviderProps) => {
  const { children, timerTiming, intervalDuration } = props;
  const [timerCount, setTimerCount] = useState<number>(timerTiming);
  const interval = useRef<number | undefined>();

  useEffect(() => () => clearInterval(interval.current), []);

  const startTimer = () => {
    if (!interval.current) {
      // eslint-disable-next-line functional/immutable-data
      interval.current = setInterval(() => {
        setTimerCount(prevCount => (prevCount > 0 ? prevCount - 1 : 0));
      }, intervalDuration);
    }
  };

  const resetTimer = () => {
    clearInterval(interval.current);
    setTimerCount(timerTiming);
    // eslint-disable-next-line functional/immutable-data
    interval.current = undefined;
  };

  const isRunning = () => interval.current !== undefined;

  return (
    <CountdownContext.Provider
      value={{ timerCount, resetTimer, startTimer, isRunning }}
    >
      {children}
    </CountdownContext.Provider>
  );
};

// Hook to use the countdown context
export const useCountdown = () => useContext(CountdownContext);
