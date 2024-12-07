const msalConfig = {
    auth: {
        clientId: "{{CLIENT_ID}}",
        authority: "https://{{AUTHORITY}}",
        redirectUri: "https://{{POST_LOGOUT_REDIRECT_URI}}",
        postLogoutRedirectUri: "https://{{POST_LOGOUT_REDIRECT_URI}}",
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false,
    },
};

const tokenRequest = {
    scopes: ["api://{{CLIENT_ID}}/{{TOKEN_SCOPE}}"]
};

const photoUploaderRole = "{{TOKEN_ROLE}}";

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