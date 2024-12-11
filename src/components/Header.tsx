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
      <div className={`${theme === 'dark' ? 'text-white bg-gray-600' : 'bg-gray-100'} py-2 items-center`}>
        <div className="flex float-left items-center">
          <a href="/">
            <img src="/app-icon.png" className="justify-start sm:px-4 max-w-24 max-h-24" alt="logo" />
          </a>
          <h2 className="text-4xl uppercase tracking-widest transform-none "></h2>
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
                    className="h-8 w-8 text-gray-600"
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

            <div className="flex justify-items-end">
              <ul className="DESKTOP-MENU hidden space-x-8 lg:flex pr-6 uppercase">
                {isAuthenticated && (
                  <li className="uppercase">
                    <a href="/upload">Upload</a>
                  </li>
                )}
                <li>
                  <a href="/">Collections</a>
                </li>
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
        background: white;
        z-index: 10;
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        align-items: center;
      }
    `}</style>
        </div>
        <div className="flex float-right items-center justify-end justify-items-end mt-5">
          {
            (isAuthenticated && userName != null) && (
              <div className="pr-4">
                Welcome, {account?.name?.split(" ")[0]}!
              </div>
            )
          }
          <SignInAndOut />
          <div className="align-middle order-last pr-4 pl-4">
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
