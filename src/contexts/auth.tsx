// External
import React, { createContext, useRef, useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";

// APIs
import {
  clearAuthHeader,
  setAuthHeader,
  registerUser,
  loginUser,
  socialLoginUser,
  verifyUser,
  socialRegisterUser,
} from "../api";

// Contexts
import { useApp } from "./app";

// Constants
import { unauthRoutes, nonRememberRoutes, adminRoute } from "../constants";

// Custom Component
import Loading from "../components/Loading";

// @ts-ignore
const context = createContext<Context>({});

export enum AuthState {
  "pending",
  "unAuthenticated",
  "authenticated",
}

// Expose this role in this auth context
export { Role } from "../constants";

import { Role } from "../constants";

/*
 Auth Flow: (TODO)

 - on app start ( when this component is mounted ):
   - call api /me to find if the localstorage token is still valid, if it is ( mark user as logged in & do nothing )
  - if token is missing or invalid: mark user as not logged in & redirect to '/login', while saving the page he was on ( or trying to access )
  - once he's logged in ( save token , mark as logged in & redirect to the page he was trying to access )
*/
export function AuthContext({ children }: Props) {
  const router = useRouter();
  const app = useApp();

  const user = useRef<User | undefined>(undefined);
  const [status, setStatus] = useState<AuthState>(AuthState.pending);
  const [previousPath, setPreviousPath] = useState("");

  // Normal login, by email and password
  async function login(email: string, password: string, preventRedirect = false): Promise<RestApi.Response> {
    try {
      const response = await loginUser(email, password);
      const { error, data, errors } = response;
      // No error happens
      if (!error) {
        user.current = data.user;

        localStorage.setItem(TOKEN_KEY, data.auth_token);
        setAuthHeader(data.auth_token);

        // Update status
        setStatus(AuthState.authenticated);

        if (!preventRedirect) {
          // If user went to specific before
          if (previousPath !== "") {
            router.push(previousPath);
          } else {
            // Go to home page
            router.push("/dashboard");
          }
        }
      } else {
        app.showErrorDialog(true, errors ? errors.toString() : "Enter a valid email/password.");
      }

      return response;
    } catch (error) {
      app.showErrorDialog(true, "Error occured while processing your request. Please try again. Error 106");
      // Unknown issue or code issues
      return { error: true, data: null, errors: "Error occured while processing your request. Please try again. Error 107" };
    }
  }

  // Login by token
  async function loginByToken(token: string, redirectAfterSuccess = true) {
    try {
      verifyUser(token)
        .then(({ data }) => {
          user.current = data;

          localStorage.setItem(TOKEN_KEY, token);
          setAuthHeader(token);
          setStatus(AuthState.authenticated);

          // Navigate to dashboard page if redirect allowed
          if (redirectAfterSuccess) {
            router.replace("/dashboard");
          }
        })
        .catch(() => {
          localStorage.removeItem(TOKEN_KEY);
          clearAuthHeader();
          setStatus(AuthState.unAuthenticated);

          // Redirect to login page
          router.replace("/login");
        });
    } catch (error) {
      app.showErrorDialog(true, "Error occured while processing your request. Please try again. Error 108");
    }
  }

  // Social login, by just social id
  async function socialLogin(socialId: number, email: string, preventRedirect = false): Promise<RestApi.Response> {
    try {
      const response = await socialLoginUser(socialId, email);
      const { error, data, errors } = response;
      // No error happens
      if (!error) {
        user.current = data.user;

        localStorage.setItem(TOKEN_KEY, data.auth_token);
        setAuthHeader(data.auth_token);

        // Update status
        setStatus(AuthState.authenticated);

        if (!preventRedirect) {
          // If user went to specific before
          if (previousPath !== "") {
            router.push(previousPath);
          } else {
            // Go to home page
            router.push("/dashboard");
          }
        }
      } else {
        app.showErrorDialog(true, errors ? errors.toString() : "Enter a valid email/password");
      }

      return response;
    } catch (error) {
      app.showErrorDialog(true, "Error occured while processing your request. Please try again. Error 109");
      // Unknown issue or code issues
      return { error: true, data: null, errors: "Error occured while processing your request. Please try again. Error 110" };
    }
  }

  // Normal register: by email and password
  async function register(payload: Register.ApiPayload) {
    try {
      console.log('auth await registerUser(payload): XXXXXXXXXX 1111');
      const response = await registerUser(payload);
      console.log('auth await registerUser(payload): XXXXXXXXXX 2222');

      const { error, data, errors } = response;
      console.log('auth await registerUser(payload): XXXXXXXXXX 3333');
      // No error happens
      if (!error) {
        localStorage.setItem(TOKEN_KEY, data.auth_token);
        setAuthHeader(data.auth_token);

        // Update status
        setStatus(AuthState.authenticated);

        user.current = data.user;

        // Navigate to register selection page
        router.push("/dashboard");
      } else {
        app.showErrorDialog(true, errors ? errors.toString() : "We are not to complete your registration. Try again. Error 111");
      }

      return response;
    } catch (error) {
      app.showErrorDialog(true, "Error occured while processing your request. Please try again. Error 112");
      // Unknown issue or code issues
      return { error: true, data: null, errors: "Error occured while processing your request. Please try again. Error 113" };
    }
  }

  // Social register, by social id and email
  async function socialRegister(payload: Register.ApiSocialPayload): Promise<RestApi.Response> {
    try {
      const response = await socialRegisterUser(payload);

      const { error, data, errors } = response;
      // No error happens
      if (!error) {
        localStorage.setItem(TOKEN_KEY, data.auth_token);
        setAuthHeader(data.auth_token);

        // Update status
        setStatus(AuthState.authenticated);

        user.current = data.user;

        // Navigate to register selection page
        router.push("/dashboard");
      } else {
        app.showErrorDialog(true, errors ? errors.toString() : "We are not to complete your registration. Try again. Error 114");
      }

      return response;
    } catch (error) {
      app.showErrorDialog(true, "Error occured while processing your request. Please try again. Error 115");
      // Unknown issue or code issues
      return { error: true, data: null, errors: "Error occured while processing your request. Please try again. Error 116" };
    }
  }

  function updateUserData() {
    return verifyUser()
      .then(({ data }) => {
        user.current = data;
        return data;
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        clearAuthHeader();
        setStatus(AuthState.unAuthenticated);

        // Redirect to login page
        router.replace("/login");

        return;
      });
  }

  function logOut() {
    // Update status
    setStatus(AuthState.pending);

    // Remove token from header
    setAuthHeader("");

    // Remove saved token value in local storage
    localStorage.removeItem(TOKEN_KEY);

    // Reset user value
    user.current = undefined;

    // Update status
    setStatus(AuthState.unAuthenticated);

    // Redirect to login page
    router.replace("/login");
  }

  // Get current user's role Id
  function getRoleId(): number | undefined {
    if (user.current) {
      const { role, artist, studio } = user.current as User;
      switch (role) {
        case Role.ARTIST: {
          return artist?.id;
        }
        case Role.STUDIO: {
          return studio?.id;
        }
        default: {
          return undefined;
        }
      }
    } else {
      return undefined;
    }
  }

  // Get current user's role detail
  function getRoleDetail() {
    if (user.current) {
      const { role, artist, studio } = user.current as User;
      switch (role) {
        case Role.ARTIST: {
          return artist as Resource.ArtistDetail;
        }
        case Role.STUDIO: {
          return studio as Resource.StudioDetail;
        }
        default: {
          return undefined;
        }
      }
    } else {
      return undefined;
    }
  }

  // Check if artist or studio complete there profile or not
  function isCompleteRoleProfile(): boolean {
    if (user.current) {
      const { role, artist, studio } = user.current as User;
      switch (role) {
        case Role.ARTIST: {
          return (artist &&
            artist &&
            artist.has_avatar &&
            artist.has_social_profiles &&
            artist.has_styles &&
            artist.has_tattoo_gallery) as boolean;
        }
        case Role.STUDIO: {
          return (studio && studio.has_avatar && studio.has_social_profiles && studio.has_tattoo_gallery) as boolean;
        }
        default: {
          return false;
        }
      }
    } else {
      return false;
    }
  }

  // Check if artist or studio has specific attributed
  function hasAttribute(name: string): boolean {
    if (user.current) {
      const { role, artist, studio } = user.current as User;
      switch (role) {
        case Role.ARTIST: {
          return (artist && artist[name]) as boolean;
        }
        case Role.STUDIO: {
          return (studio && studio[name]) as boolean;
        }
        default: {
          return false;
        }
      }
    } else {
      return false;
    }
  }

  useEffect(() => {
    // Only save remember router
    if (nonRememberRoutes.indexOf(router.pathname) === -1) {
      // Store this url to get back later
      setPreviousPath(router.pathname);
    }
  }, [router.pathname]);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);

    // No token available
    if (!token) {
      setStatus(AuthState.unAuthenticated);

      // Any route is not defined as unauth route will be redirected to register page
      if (unauthRoutes.indexOf(router.pathname) === -1) {
        // Only save remember router
        if (nonRememberRoutes.indexOf(router.pathname) === -1) {
          // Store this url to get back later
          setPreviousPath(router.pathname);
        }

        // Redirect to home page
        router.replace("/login");
      }

      return;
    }
    setAuthHeader(token);
    verifyUser()
      .then(({ data }) => {
        user.current = data;

        // Redirect to dashboard if not unauthRoute or adminRoute
        if (unauthRoutes.indexOf(router.pathname) === -1 && router.pathname.substring(0, 6) !== adminRoute) {
          // Navigate to dashboard page
          router.replace("/dashboard");
        }

        setStatus(AuthState.authenticated);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        clearAuthHeader();
        setStatus(AuthState.unAuthenticated);

        // Redirect to login page
        router.replace("/login");
      });
  }, []);

  return (
    <context.Provider
      value={{
        user: user.current,
        status,
        register,
        socialRegister,
        login,
        loginByToken,
        socialLogin,
        logOut,
        updateUserData,
        previousPath,
        getRoleId,
        getRoleDetail,
        isCompleteRoleProfile,
        hasAttribute,
      }}
    >
      {status === AuthState.pending ? <Loading fixed /> : null}
      {status === AuthState.authenticated ? children : null}
      {status === AuthState.unAuthenticated ? children : null}
    </context.Provider>
  );
}

export function useAuth() {
  return useContext(context);
}

interface Props {
  children: JSX.Element;
}

export type User = {
  email: string;
  id: number;
  full_name: string;
  avatar: Resource.Image;
  role: Role;
  artist?: Resource.ArtistDetail;
  studio?: Resource.StudioDetail;
};

interface Context {
  user?: User;
  login: (email: string, password: string, preventRedirect: boolean) => Promise<RestApi.Response>;
  loginByToken: (token: string, redirectAfterSuccess: boolean) => void;
  socialLogin: (socialId: number, email: string, preventRedirect: boolean) => Promise<RestApi.Response>;
  register: (payload: Register.ApiPayload) => void;
  socialRegister: (payload: Register.ApiSocialPayload) => Promise<RestApi.Response>;
  logOut: () => void;
  status: AuthState;
  previousPath: string;
  updateUserData: () => void;
  getRoleId: () => number | undefined;
  getRoleDetail: () => any;
  isCompleteRoleProfile: () => boolean;
  hasAttribute: (name: string) => boolean;
}

const TOKEN_KEY = "AUTH_TOKEN";
