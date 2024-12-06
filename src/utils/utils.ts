import { AccountInfo, SilentRequest, AuthenticationResult } from "@azure/msal-browser";

export const getAccessToken = (instance: any, accounts: AccountInfo[], tokenRequest: SilentRequest, setToken: (token: string) => void): void => {
    instance.acquireTokenSilent({
        ...tokenRequest
    })
        .then((response: AuthenticationResult) => {
            setToken(response.accessToken);
        })
        .catch((error: any) => {
            console.log("error while getting access token: " + error);
        });
}