"use client";
import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import { useState } from "react";
import Drawer from "../../components/nav/Drawer";
import Logo from "../../public/logo.svg";
import Balancer from "react-wrap-balancer";

const inter = Inter({ subsets: ["latin"] });

export default function Page() {
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <div className={`min-h-screen ${inter.className}`}>
      <Head>
        <title>Brown University - Resolutions</title>
        <meta
          name="description"
          content="Make improvements to your lifestyle with Harvard"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Navigation */}
      <nav className="fixed w-full bg-white/95 backdrop-blur-sm z-50 border-b">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <Image
                src={Logo}
                alt="Harvard University"
                width={150}
                height={40}
                className="h-8 w-auto"
              />
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-md hover:bg-gray-100">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
              <button
                onClick={() => setIsNavOpen(true)}
                className="p-2 rounded-md hover:bg-gray-100"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <Drawer isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />

      {/* Hero Section with Gradient Overlay */}
      <section className="relative h-screen">
        <div className="absolute inset-0">
          <Image
            src="/bpr.jpeg"
            alt="Students celebrating"
            layout="fill"
            objectFit="cover"
            className="brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/70 to-white"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <Balancer className="text-8xl text-blacks mb-4 text-center py-9">
            Change
          </Balancer>
          <Balancer></Balancer>
          <p className="text-xl text-black max-w-2xl">
            Whether you want to make small improvements to your lifestyle or
            treat yourself to some useful knowledge, the Harvard community can
            help you start something new this year.
          </p>
        </div>
      </section>

      {/* Guide Section with Extended Gradient */}
      <section className="relative py-16 bg-white">
        <div className="absolute inset-0 bg-gradient-to-b from-white/0 to-white pointer-events-none"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div></div>
            <div>
              <div className="text-sm font-medium text-gray-600 mb-2">
                BEFORE YOU CHOOSE
              </div>
              <h2 className="text-4xl font-serif mb-4">
                A guide to keeping your resolution
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Moving forward, even slowly, puts your goals within reach.
              </p>
              <button className="inline-flex items-center space-x-2 text-crimson-600 hover:text-crimson-700">
                <span>Learn more about sticking to resolutions</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <svg
              className="h-12 w-12 text-crimson-600 mb-6"
              fill="currentColor"
              viewBox="0 0 32 32"
            >
              <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
            </svg>
            <h2 className="text-4xl font-serif mb-6">
              If you have a motivation to change, you can improve
            </h2>
          </div>
        </div>
      </section>
    </div>
  );
}
