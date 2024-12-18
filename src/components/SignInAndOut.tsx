import React from 'react';
import { loginRequest, msalConfig, tokenRequest } from '../config/msalConfig.ts';
import { useState } from 'react';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { useTheme } from '../context/ThemeContext.tsx';

export default function SignInAndOut() {
    const [token, setToken] = useState<string | null>(null);
    const [interactionInProgress, setInteractionInProgress] = useState(false);
    const { instance, inProgress } = useMsal();
    const isAuthenticated = useIsAuthenticated();
    const { theme } = useTheme();

    async function handleSignIn() {
        const loginResponse = await instance.loginPopup(loginRequest);
        setInteractionInProgress(true);
        if (loginResponse.account) {
            instance.setActiveAccount(loginResponse.account);
            instance.acquireTokenSilent({
                ...tokenRequest,
                account: loginResponse.account
            }).then((response) => {
                setToken(response.accessToken);
            }).catch(async (error) => {
                const response = await instance.acquireTokenPopup(loginRequest);
                setToken(response.accessToken);
            });
        }
        setInteractionInProgress(false);
    }

    async function handleSignOut() {
        if (!interactionInProgress) {
            const logoutRequest = {
                account: instance.getActiveAccount(),
                mainWindowRedirectUri: msalConfig.auth.redirectUri,
                postLogoutRedirectUri: msalConfig.auth.postLogoutRedirectUri
            }
            setInteractionInProgress(true);
            await instance.logoutPopup(logoutRequest);
            instance.handleRedirectPromise();
            setInteractionInProgress(false);
        }
        else {
            console.log("Interaction in progress, cannot logout...");
        }
    }

    return (
        <div>
            {
                isAuthenticated ? (
                    <div>
                        <span className={`mr-7  ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>I</span>
                        <button onClick={handleSignOut} className={`uppercase ${theme === 'dark' ? 'hover:text-white text-gray-300' : 'hover:text-gray-800 text-gray-500'}`}>Sign Out</button>
                    </div>
                ) : (
                    <div>
                        <button onClick={handleSignIn} className={`uppercase ${theme === 'dark' ? 'hover:text-white text-gray-300' : 'hover:text-gray-800 text-gray-500'}`}>Sign In</button>
                    </div>
                )
            }
        </div>
    )
}
