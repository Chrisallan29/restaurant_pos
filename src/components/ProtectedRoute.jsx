import { Navigate } from "react-router-dom";
import LoginForm from "../scenes/LoginForm/LoginForm";
import { Component } from "react";

export const ProtectedRoute = ({children, user}) => {
    console.log(user)
    return user ? children : <Navigate to="/signin-error"></Navigate>;
};

export default ProtectedRoute
// export const ProtectedRoute = ({auth, component: Component, ...rest}) => {
//     return (
//         <Route
//         {...rest}
//         render = {(props) => {
//             if (auth) return <Component {...props}/>;
//             if (!auth) return <Redirect to ={{path:"/", state: {from: props.location}}}/>;
//         }}
//         />

//     )
// }