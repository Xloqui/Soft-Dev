import { useEffect, useMemo, useRef, useState } from 'react';
import { actions, loadState, saveState } from './store.js';
import { StoreContext } from './storeContext.js';

// Holds the app data and gives every page access to it through useStore().
export default function StoreProvider({ children }) {
  const [state, setState] = useState(loadState);
  const latest = useRef(state);

  useEffect(() => {
    latest.current = state;
    saveState(state);
  }, [state]);

  // Wrap every action so it works on a copy of the latest state, then saves it.
  const act = useMemo(() => {
    const bound = {};

    Object.entries(actions).forEach(([name, fn]) => {
      bound[name] = (...args) => {
        const next = structuredClone(latest.current);
        const result = fn(next, ...args);
        latest.current = next;
        setState(next);
        return result;
      };
    });

    return bound;
  }, []);

  const value = useMemo(() => ({ state, session: state.session, act }), [state, act]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
