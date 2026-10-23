// Public SPA configuration. Never put an Auth0 client secret in browser code.
export const authConfig = {
  domain: "dev-bpbgrel3zl2chj7s.us.auth0.com",
  clientId: "lWFWbWJEMrJjJ6CXI4SWQGhYb1iYT7Wa",
  authorizationParams: {
    audience: "https://dev-bpbgrel3zl2chj7s.us.auth0.com/api/v2/",
    redirect_uri: window.location.origin + window.location.pathname
  }
};

let clientPromise;

function client() {
  if (!clientPromise) {
    clientPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.auth0.com/js/auth0-spa-js/2.29/auth0-spa-js.production.js";
      script.onload = () => resolve(new window.auth0.Auth0Client(authConfig));
      script.onerror = () => {
        script.remove();
        reject(new Error("Não foi possível carregar o login. Tente novamente."));
      };
      document.head.append(script);
    }).catch(error => {
      clientPromise = undefined;
      throw error;
    });
  }
  return clientPromise;
}

export async function initializeAuth() {
  const auth = await client();
  const params = new URLSearchParams(window.location.search);
  if (params.has("state") && (params.has("code") || params.has("error"))) {
    try {
      const result = await auth.handleRedirectCallback();
      const route = result.appState?.route;
      history.replaceState({}, "", location.pathname + "?demo=0" +
        (typeof route === "string" && route.startsWith("#/") ? route : "#/"));
    } catch (error) {
      history.replaceState({}, "", location.pathname + "?demo=0#/");
      throw error;
    }
  } else {
    await auth.checkSession();
  }
  return auth.isAuthenticated();
}

export async function login() {
  localStorage.setItem("gamelibrary-demo-mode", "off");
  return (await client()).loginWithRedirect({ appState: { route: location.hash } });
}

export async function logout() {
  return (await client()).logout({
    logoutParams: { returnTo: authConfig.authorizationParams.redirect_uri }
  });
}

export async function accessToken() {
  try {
    return await (await client()).getTokenSilently();
  } catch {
    throw new Error("Sua sessão precisa ser renovada. Clique em Entrar para continuar.");
  }
}
