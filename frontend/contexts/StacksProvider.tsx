'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { APP_NAME, APP_ICON } from '@/lib/stacksConfig';

interface StacksContextType {
  userSession: UserSession;
  userData: any;
  isConnected: boolean;
  address: string | null;
  connect: () => void;
  disconnect: () => void;
}

const StacksContext = createContext<StacksContextType | undefined>(undefined);

const appConfig = new AppConfig(['store_write', 'publish_data']);

export function StacksProvider({ children }: { children: ReactNode }) {
  const [userSession] = useState(() => new UserSession({ appConfig }));
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData());
    }
  }, [userSession]);

  const connect = () => {
    showConnect({
      appDetails: {
        name: APP_NAME,
        icon: APP_ICON,
      },
      onFinish: () => {
        setUserData(userSession.loadUserData());
      },
      userSession,
    });
  };

  const disconnect = () => {
    userSession.signUserOut();
    setUserData(null);
  };

  const value = {
    userSession,
    userData,
    isConnected: userSession.isUserSignedIn(),
    address: userData?.profile?.stxAddress?.mainnet || null,
    connect,
    disconnect,
  };

  return <StacksContext.Provider value={value}>{children}</StacksContext.Provider>;
}

export const useStacks = () => {
  const context = useContext(StacksContext);
  if (!context) {
    throw new Error('useStacks must be used within StacksProvider');
  }
  return context;
};
