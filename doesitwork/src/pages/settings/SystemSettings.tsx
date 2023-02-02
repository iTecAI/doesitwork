import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useLogin } from "../../util/LoginState";

export function SystemSettings() {
    const login = useLogin();
    const nav = useNavigate();

    useEffect(() => {
        if (!login.loggedIn) {
            nav("/");
        }
    }, [login]);

    return <></>;
}
