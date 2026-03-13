/**
 * SignInAndOut — Authentication button that toggles between Sign In and
 * Sign Out using MSAL popup flows. Styled to fit the sidebar design.
 */
import React from 'react';
import { loginRequest, msalConfig, tokenRequest } from '../config/msalConfig.ts';
import { useState } from 'react';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { useTheme } from '../context/ThemeContext.tsx';
import { IoLogIn, IoLogOut } from 'react-icons/io5';

export default function SignInAndOut({ collapsed = false }: { collapsed?: boolean }) {
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

    const btnClass = `flex items-center gap-2 w-full px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
        theme === 'dark'
            ? 'text-gray-400 hover:text-white hover:bg-sidebar-hover'
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
    } ${collapsed ? 'justify-center' : ''}`;

    return (
        <div>
            {isAuthenticated ? (
                <button onClick={handleSignOut} className={btnClass}>
                    <IoLogOut size={20} />
                    {!collapsed && <span>Sign Out</span>}
                </button>
            ) : (
                <button onClick={handleSignIn} className={btnClass}>
                    <IoLogIn size={20} />
                    {!collapsed && <span>Sign In</span>}
                </button>
            )}
        </div>
    )
}
