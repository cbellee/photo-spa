import { useState, useEffect } from 'react';
import { useMsal, useIsAuthenticated, useAccount } from '@azure/msal-react';
import { tokenRequest } from '../config/msalConfig';

export function useAuth() {
    const { instance, accounts, inProgress } = useMsal();
    const isAuthenticated = useIsAuthenticated();
    const account = useAccount(instance.getActiveAccount() ?? undefined);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        if (isAuthenticated) {
            instance.acquireTokenSilent({ ...tokenRequest })
                .then((response) => setToken(response.accessToken))
                .catch((error) => console.log('error while getting access token: ' + error));
        }
    }, [isAuthenticated, instance]);

    return {
        isAuthenticated,
        account,
        token,
        instance,
        accounts,
        inProgress,
    };
}
