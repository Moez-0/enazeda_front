import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import Navbar from "./Navbar";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-14 sm:pt-16 pb-24">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
