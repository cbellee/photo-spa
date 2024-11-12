const msalConfig = {
    auth: {
        clientId: "689078c3-c0ad-4c10-a0d3-1c430c2e471d",
        authority: "https://belleenetexternal.ciamlogin.com",
        redirectUri: "https://gallery.bellee.net",
    },
    cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: false,
    },
};

const loginRequest = {
    scopes: ["openid", "offline_access"],
    redirectUri: "https://gallery.bellee.net",
};

const tokenRequest = {
    scopes: ["User.ReadWrite.All"]
};

const graphConfig = {
    graphUsersEndpoint: "https://graph.microsoft.com/v1.0/users"
};

export {
    msalConfig,
    loginRequest,
    tokenRequest,
    graphConfig
};