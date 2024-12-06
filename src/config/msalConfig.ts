const msalConfig = {
    auth: {
        clientId: "689078c3-c0ad-4c10-a0d3-1c430c2e471d",
        //clientId: "e6e67d46-9db8-479f-a35f-e357aa1a7ed6",
        authority: "https://belleenetexternal.ciamlogin.com",
        redirectUri: "/",
        //postLogoutRedirectUri: "https://gallery.bellee.net",
        postLogoutRedirectUri: "http://localhost:5173",
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false,
    },
};

const tokenRequest = {
    scopes: ["api://689078c3-c0ad-4c10-a0d3-1c430c2e471d/photo.all"]
};

const photoUploaderRole = "photo.upload";

/**
 * Scopes you add here will be prompted for user consent during sign-in.
 * By default, MSAL.js will add OIDC scopes (openid, profile, email) to any login request.
 * For more information about OIDC scopes, visit:
 * https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
 */

const loginRequest = {
    scopes: ["openid", "offline_access", "User.ReadWrite.All"],
};

export {
    msalConfig,
    loginRequest,
    tokenRequest,
    photoUploaderRole
};