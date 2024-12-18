import React, { useEffect, useState } from "react";
import SignInAndOut from "./SignInAndOut.tsx";
import { IoMoon } from "react-icons/io5";
import { IoSunny } from "react-icons/io5";
import { useIsAuthenticated, useMsal, useAccount } from "@azure/msal-react";
import { useTheme } from "../context/ThemeContext.tsx";

export default function Header() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [userName, setUserName] = useState<String>("");
  const { instance, inProgress } = useMsal();
  const account = useAccount(instance.getActiveAccount() ?? undefined);
  const isAuthenticated = useIsAuthenticated();
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <div className={`${theme === 'dark' ? 'text-white bg-gray-800' : 'bg-gray-100'} text-lg py-2 items-center !h-auto`}>
        <div className="flex float-left items-center">
          <a href="/">
            <img src="/app-icon.png" className="justify-start sm:px-4 max-w-20" alt="logo" />
          </a>
          <h2 className="text-4xl uppercase tracking-widest transform-none"></h2>
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

              <div className={isNavOpen ? "showMenuNav" : "hideMenuNav"}>
                <div
                  className="absolute top-0 right-0 px-8 py-8"
                  onClick={() => setIsNavOpen(false)}
                >
                  <svg
                    className="h-8 w-8 text-gray-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </div>
                <ul className="flex flex-col items-center justify-between min-h-[250px]">
                  {isAuthenticated && (
                    <li className="uppercase">
                      <a href="/upload">Upload</a>
                    </li>
                  )}
                  <li className="uppercase">
                    <a href="/">Collections</a>
                  </li>
                  <li className="uppercase">
                    <SignInAndOut />
                  </li>
                </ul>
              </div>
            </section>

            <div className="flex justify-items-end text-gray-300 ml-6">
              <ul className="DESKTOP-MENU hidden space-x-8 lg:flex pr-6 uppercase">
                {isAuthenticated && (
                  <li className="uppercase">
                    <a href="/upload">Upload</a>
                  </li>
                )}
       
                <li>
                  <a href="/" className={`${theme === 'dark' ? 'hover:text-white text-gray-300' : 'hover:text-gray-800 text-gray-500'}`}>Collections</a>
                </li>
                <span className={`align-top flex ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>I</span>
                <li>
                <a href="/" className={`${theme === 'dark' ? 'hover:text-white text-gray-300' : 'hover:text-gray-800 text-gray-500'}`}>About</a>
                </li>
                <span className={`align-top flex ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>I</span>
                <li>
                </li>
              </ul>
            </div>
          </nav>
          <style>{`
      .hideMenuNav {
        display: none;
      }
      .showMenuNav {
        display: block;
        position: absolute;
        width: 100%;
        height: 100vh;
        top: 0;
        left: 0;
        background: ${theme === 'dark' ? 'rgb()' : 'white'};
        color: ${theme === 'dark' ? 'white' : 'gray'};
        z-index: 10;
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        align-items: center;
      }
    `}</style>
        </div>
        <div className="flex justify-end mt-3">
        <span className={`align-top flex mr-7 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>I</span>
          {
            (isAuthenticated && userName != null) && (
              <div className="pr-4">
                Welcome, {account?.name?.split(" ")[0]}!
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
    </>
  );
}
