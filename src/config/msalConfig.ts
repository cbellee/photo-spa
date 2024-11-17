const msalConfig = {
    auth: {
        clientId: "689078c3-c0ad-4c10-a0d3-1c430c2e471d",
        authority: "https://belleenetexternal.ciamlogin.com",
        redirectUri: "/",
        postLogoutRedirectUri: "https://gallery.bellee.net",
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
    scopes: ["api://689078c3-c0ad-4c10-a0d3-1c430c2e471d/photo.upload.scope"]
};

export {
    msalConfig,
    loginRequest,
    tokenRequest
};