// components/Layout.jsx
import Header from "./Header/Header";
import Footer from "./Footer";
import { Toaster } from "react-hot-toast";

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col">
            <Toaster />
            <Header />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
