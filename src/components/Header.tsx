import React, { useState } from "react";
import SignInAndOut from "./SignInAndOut.tsx";
import { IoMoon } from "react-icons/io5";
import { IoSunny } from "react-icons/io5";
import { useIsAuthenticated, useMsal, useAccount } from "@azure/msal-react";
import { useTheme } from "../context/ThemeContext.tsx";
import NavLinks from "./NavLinks";
import MobileMenu from "./MobileMenu";

export default function Header() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const { instance } = useMsal();
  const account = useAccount(instance.getActiveAccount() ?? undefined);
  const isAuthenticated = useIsAuthenticated();
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <div className={` text-lg ${theme === 'dark' ? 'text-white bg-gray-950' : 'bg-gray-100'}`}>
        <div className="flex items-center">
          <a href="/">
            <img src="/app-icon.png" className="justify-start max-h-16 min-h-16 p-2" alt="logo" />
          </a>
          <h2 className="text-2xl uppercase tracking-widest transform-none font-extralight"></h2>
          <nav>
            <section className="MOBILE-MENU flex lg:hidden">
              <div
                className="HAMBURGER-ICON space-y-2 pr-5"
                onClick={() => setIsNavOpen((prev) => !prev)}
              >
                <span className="block h-0.5 w-8 animate-pulse bg-gray-600"></span>
                <span className="block h-0.5 w-8 animate-pulse bg-gray-600"></span>
                <span className="block h-0.5 w-8 animate-pulse bg-gray-600"></span>
              </div>

              <MobileMenu
                isOpen={isNavOpen}
                isAuthenticated={isAuthenticated}
                onClose={() => setIsNavOpen(false)}
              />
            </section>

            <div className=" text-gray-300 ml-6">
              <NavLinks isAuthenticated={isAuthenticated} />
            </div>
          </nav>
          <div className="flex-grow"></div>
          <div className="flex items-center min-w-max text-sm">
            {
              isAuthenticated && (
                <div className="pr-7 uppercase text-gray-300 align-bottom flex justify-evenly">
                  <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-400'}`}>Welcome, <span className="text-orange-300">&nbsp;{account?.name?.split(" ")[0]}</span></span>
                </div>
              )
            }
            <SignInAndOut />
            <span className={`align-top flex ml-7 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>I</span>
            <div className="align-middle order-last pr-4 pl-7 pt-0.5">
              <button onClick={toggleTheme}>
                {
                  theme === "dark" && <IoSunny />
                }
                {
                  theme === "light" && <IoMoon />
                }
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
