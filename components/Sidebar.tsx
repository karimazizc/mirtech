"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { House, User, Settings, ChevronsRight, ChevronsLeft } from "lucide-react";
export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const pathname = usePathname();

  const navItems = [
    { name: "Home", path: "/home", icon: <House/> },
    { name: "Profile", path: "/profile", icon: <User /> },
    { name: "Settings", path: "/settings", icon: <Settings/> },
  ];

  return (
    <aside
      className={`sticky left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-50 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */} 
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-4 border-b border-gray-200`}>
          {!isCollapsed && <div>
            <Image src={'/jensi.svg'} alt='Jensi Icon' width={100} height={50} className="object-cover h-full"></Image>
            </div>}
            
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            {isCollapsed ? (
              <div className="group relative">
                <Image src={'/favicon.ico'} alt='Jensi Logo' width={25} height={25} className="group-hover:opacity-0 transition-opacity"/>
                <ChevronsRight className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"/>
              </div>
            ) : (
              <ChevronsLeft className=""/>
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      isActive
                        ? "bg-[#1a7faf] text-white"
                        : "text-black hover:bg-gray-100"
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    {!isCollapsed && (
                      <span className="font-medium">{item.name}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          {!isCollapsed ? (
            <div className="text-xs text-gray-500">
              <p>MirTech Dashboard</p>
              <p className="mt-1">v1.0.0</p>
            </div>
          ) : (
            <div className="text-center text-xs text-gray-500">v1</div>
          )}
        </div>
      </div>
    </aside>
  );
}
