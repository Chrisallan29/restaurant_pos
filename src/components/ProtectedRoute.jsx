import { Navigate } from "react-router-dom";
import LoginForm from "../../scenes/LoginForm/LoginForm";

export const ProtectedRoute = ({children, user}) => {
    console.log(user)
    return user ? children : <Navigate to="/"></Navigate>;
};