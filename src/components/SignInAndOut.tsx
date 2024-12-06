import React from 'react';
import { loginRequest, tokenRequest } from '../config/msalConfig.ts';
import { useState } from 'react';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';

export default function SignInAndOut() {
    const [token, setToken] = useState<string | null>(null);
    const [interactionInProgress, setInteractionInProgress] = useState(false);
    const { instance, inProgress } = useMsal();
    const isAuthenticated = useIsAuthenticated();

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
                console.log("access token in sign in: " + JSON.stringify(response.accessToken));
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
                mainWindowRedirectUri: "https://gallery.bellee.net",
                postLogoutRedirectUri: "https://gallery.bellee.net",
            }
            setInteractionInProgress(true);
            await instance.logoutPopup(logoutRequest);
            instance.handleRedirectPromise();
            setInteractionInProgress(false);
        }
        else {
            // console.log("Interaction in progress, cannot logout");
        }
    }

    return (
        <div>
            {
                isAuthenticated ? (
                    <div>
                        <button onClick={handleSignOut} className='uppercase'>Sign Out</button>
                    </div>
                ) : (
                    <button onClick={handleSignIn} className='uppercase'>Sign In</button>
                )
            }
        </div>
    )
}
