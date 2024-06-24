import * as React from 'react';
import Social from '../controllers/Social';

type SocialContextType = {
  social: Social;
};

export const SocialContext = React.createContext<SocialContextType | undefined>(undefined);

type SocialProviderProps = {
  children: React.ReactNode;
  contractId?: string;
  onProvision?: (social: Social) => void;
};

export const SocialProvider = ({
  children,
  contractId,
  onProvision,
}: SocialProviderProps) => {
  const [social] = React.useState<Social>(new Social({ contractId }));

  React.useEffect(() => {
    if (contractId) {
      social.setContractId(contractId);
    }
  }, [contractId, social]);

  React.useEffect(() => {
    if (onProvision) {
      onProvision(social);
    }
  }, [social, onProvision]);

  return (
    <SocialContext.Provider value={{ social }}>
      {children}
    </SocialContext.Provider>
  );
};
