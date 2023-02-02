import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";
import { AdminUser } from "../types";
import { del, get, post } from "./api";

type LoginContextType =
    | {
          loggedIn: true;
          session: string;
          user: AdminUser;
          login: (username: string, password: string) => Promise<boolean>;
          logout: () => void;
          refresh: () => void;
      }
    | {
          loggedIn: false;
          login: (username: string, password: string) => Promise<boolean>;
      };

const LoginContext = createContext<LoginContextType>({
    loggedIn: false,
    login: async (username, password) => false,
});

export function LoginProvider(props: { children?: ReactNode | ReactNode[] }) {
    const [session, setSession] = useState<string | null>(null);
    const [user, setUser] = useState<AdminUser | null>(null);

    useEffect(() => {
        if (window.localStorage.getItem("token")) {
            get<AdminUser>("/admin/").then((result) => {
                if (result.success) {
                    setUser(result.data);
                    setSession(window.localStorage.getItem("token"));
                } else {
                    setUser(null);
                    setSession(null);
                    window.localStorage.removeItem("token");
                }
            });
        }
    }, []);

    async function login(username: string, password: string): Promise<boolean> {
        const result = await post<string>("/admin", {
            data: { username, password },
        });
        if (result.success) {
            window.localStorage.setItem("token", result.data);
            get<AdminUser>("/admin/").then((result) => {
                if (result.success) {
                    setUser(result.data);
                    setSession(window.localStorage.getItem("token"));
                }
            });
            return true;
        } else {
            return false;
        }
    }

    return (
        <LoginContext.Provider
            value={
                session
                    ? {
                          loggedIn: true,
                          session: session as string,
                          user: user as AdminUser,
                          login,
                          logout: () => {
                              del<null>("/admin").then((result) => {
                                  setSession(null);
                                  setUser(null);
                              });
                          },
                          refresh: () => {
                              if (window.localStorage.getItem("token")) {
                                  get<AdminUser>("/admin/").then((result) => {
                                      if (result.success) {
                                          setUser(result.data);
                                          setSession(
                                              window.localStorage.getItem(
                                                  "token"
                                              )
                                          );
                                      }
                                  });
                              }
                          },
                      }
                    : {
                          loggedIn: false,
                          login,
                      }
            }
        >
            {props.children}
        </LoginContext.Provider>
    );
}

export function useLogin(): LoginContextType {
    const context = useContext(LoginContext);
    return context;
}
