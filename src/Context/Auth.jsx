import { onAuthStateChanged } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../Components/Firebase/Firebase";


const AuthContext = createContext(null);

export const UserAuth = () => useContext(AuthContext);


export const AuthProvider = ({children} ) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    },[]);

    return(
        <AuthContext.Provider  value={{user}}>
            {children}
        </AuthContext.Provider>
    )
 }