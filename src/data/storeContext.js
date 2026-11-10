import { createContext, useContext } from 'react';

export const StoreContext = createContext(null);

// Use inside any component:  const { state, session, act } = useStore();
// Then change data with e.g. act.addLostReport({ ... }).
export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used inside <StoreProvider>');
  return store;
}
