import { loginRequest, tokenRequest } from '../config/msalConfig';
import { useState } from 'react';
import { useIsAuthenticated } from '@azure/msal-react';
import { useMsal } from '@azure/msal-react';

export default function SignInAndOut() {
    const [token, setToken] = useState(null);
    const [interactionInProgress, setInteractionInProgress] = useState(false);
    const { instance, inProgress } = useMsal();
    const isAuthenticated = useIsAuthenticated();

    async function handleSignIn() {
        const loginResponse = await instance.loginPopup(loginRequest);/*  */
        if (loginResponse.account) {
            instance.setActiveAccount(loginResponse.account);
        }
        const tokenResponse = await instance.acquireTokenSilent(tokenRequest);
        setToken(tokenResponse.accessToken);
        setInteractionInProgress(false);
    }

    async function handleSignOut() {
        if (!interactionInProgress) {
            const logoutRequest = {
                account: instance.getActiveAccount(),
                mainWindowRedirectUri: "http://localhost:5173",
                postLogoutRedirectUri: "http://localhost:5173",
            }
            setInteractionInProgress(true);
            await instance.logoutPopup(logoutRequest);
            instance.handleRedirectPromise();
            setToken(null);
            setInteractionInProgress(false);
        }
        else {
            console.log("Interaction in progress, cannot logout");
        }
    }

    return (
        <div>
            {
                isAuthenticated ? (
                    <div>
                        <button onClick={handleSignOut} className='uppercase'>Sign Out</button>
                        {console.log(token)}
                    </div>
                ) : (
                    <button onClick={handleSignIn} className='uppercase'>Sign In</button>
                )
            }
        </div>
    )
}

