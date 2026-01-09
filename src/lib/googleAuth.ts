declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token: string }) => void;
          }) => {
            requestAccessToken: () => void;
          };
        };
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: {
              credential: string;
            }) => void;
          }) => void;
          renderButton: (element: HTMLElement, config: {
            theme: string;
            size: string;
            text: string;
            width?: string;
          }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export const initializeGoogleAuth = (clientId: string, onSuccess: (credential: string) => void) => {
  if (!window.google) {
    console.error("Google Sign-In script not loaded");
    return;
  }

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: (response) => {
      onSuccess(response.credential);
    },
  });
};

export const renderGoogleButton = (
  elementId: string,
  clientId: string,
  onSuccess: (credential: string) => void
) => {
  if (!window.google) {
    console.error("Google Sign-In script not loaded");
    return;
  }

  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: (response) => {
      onSuccess(response.credential);
    },
  });

  window.google.accounts.id.renderButton(element, {
    theme: "outline",
    size: "large",
    text: "signin_with",
    width: "100%",
  });
};

export const promptGoogleSignIn = () => {
  if (!window.google) {
    console.error("Google Sign-In script not loaded");
    return;
  }

  window.google.accounts.id.prompt();
};
