import { loginRequest } from '../config/msalConfig';
import { useState } from 'react';
import { useIsAuthenticated } from '@azure/msal-react';
import { useMsal } from '@azure/msal-react';

export default function SignInAndOut() {
    const [token, setToken] = useState(null);
    const [interactionInProgress, setInteractionInProgress] = useState(false);
    const { instance, inProgress } = useMsal();
    const isAuthenticated = useIsAuthenticated();

    async function handleSignIn() {
        const loginResponse = await instance.loginPopup(loginRequest);
        setInteractionInProgress(true);
        if (loginResponse.account) {
            instance.setActiveAccount(loginResponse.account);
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
            console.log("Interaction in progress, cannot logout");
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
