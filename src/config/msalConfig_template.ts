const msalConfig = {
    auth: {
        clientId: "{{CLIENT_ID}}",
        authority: "{{AUTHORITY}}",
        redirectUri: "{{REDIRECT_URI}}",
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false,
    },
};

const loginRequest = {
    scopes: ["openid", "offline_access", "User.ReadWrite.All"]
};

const tokenRequest = {
    scopes: ["{{TOKEN_SCOPES}}"]
};

export {
    msalConfig,
    loginRequest,
    tokenRequest
};