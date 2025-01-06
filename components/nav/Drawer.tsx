"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}
const Drawer = ({ isOpen, onClose }: NavigationDrawerProps) => {
  // Track which top-level menu is expanded
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Track which subpage has been clicked/selected
  const [activeSubLink, setActiveSubLink] = useState<string | null>(null);

  const mainLinks = [
    {
      name: "Campus",
      href: "/campus",
      subPages: [
        { name: "Libraries", href: "/campus/libraries" },
        { name: "Museums", href: "/campus/museums" },
        { name: "Athletics", href: "/campus/athletics" },
      ],
    },
    {
      name: "About",
      href: "/about",
      subPages: [
        { name: "History", href: "/about/history" },
        { name: "Faculty", href: "/about/faculty" },
      ],
    },
    {
      name: "Posts",
      href: "/posts",
    },
    {
      name: "Authors",
      href: "/posts/authors",
    },
    {
      name: "Tags",
      href: "/posts/tags",
    },
    {
      name: "Categories",
      href: "/posts/categories",
    },
  ];

  // Toggles open/close for a main menu item
  const handleToggle = (menuName: string) => {
    if (mainLinks.find((link) => link.name === menuName)?.subPages) {
      setOpenMenu((prev) => (prev === menuName ? null : menuName));
    } else {
      const location =
        mainLinks.find((link) => link.name === menuName)?.href || "/";
      window.location.href = location;
    }
  };

  // Quick links or other links you might have
  const quickLinks = [
    { name: "A to Z index", href: "/a-to-z" },
    { name: "Find a Person", href: "/find-person" },
    // ...
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 w-full h-full bg-black transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        {/* Header */}
        <div className="flex justify-end items-center p-4 border-b border-gray-800">
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 p-2"
          >
            <span className="mr-2">Close</span>
            <span className="text-xl">×</span>
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="px-4 py-6">
          {mainLinks.map((link) => {
            return (
              <div key={link.name} className="mb-4">
                {/* Top-level link */}
                <button
                  onClick={() => handleToggle(link.name)}
                  className={
                    "block w-full text-left text-2xl font-serif py-3 transition-colors text-white hover:text-gray-300"
                  }
                  style={{
                    fontSize: "2rem",
                    padding: "1rem 0.5rem",
                    transitionDelay: "0.2s",
                  }}
                >
                  {link.name}
                </button>

                {/* Submenu (only if subPages exist and is expanded) */}
                {link.subPages && openMenu === link.name && (
                  <div className="ml-4 mt-2 border-l border-gray-700 pl-4">
                    {link.subPages.map((subLink) => {
                      const isSubActive = activeSubLink === subLink.href;
                      return (
                        <Link
                          key={subLink.name}
                          href={subLink.href}
                          onClick={() => setActiveSubLink(subLink.href)}
                          className={`block py-1 text-lg transition-colors text-white ${
                            isSubActive ? "text-gray-300" : "text-gray-400"
                          } hover:text-gray-200`}
                          style={{
                            color: isSubActive ? "#f8f8f8" : "#d1d5db",
                          }}
                        >
                          {subLink.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Quick Links */}
        <div className="absolute bottom-0 left-0 right-0 bg-zinc-900 px-4 py-6">
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {quickLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Drawer;
