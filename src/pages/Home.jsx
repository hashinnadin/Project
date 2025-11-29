import React, { useEffect } from "react";
import {
  cake1,
  cake2,
  cake3,
  cake4,
  cake6,
  Butterscotch_MilkChocolateCake,
  DarkChocolateMousseCake,
  DutchTruffleCakehalfkg,
} from "../assets";

function Home() {
  const featuredCakes = [
    { img: cake1, name: "Chocolate Cake" },
    { img: cake2, name: "Strawberry Cake" },
    { img: cake3, name: "Vanilla Cake" },
    { img: cake4, name: "Party Mix Cake" },
    { img: cake6, name: "Special Chocolate" },
    { img: Butterscotch_MilkChocolateCake, name: "Butterscotch MilkChoco" },
    { img: DarkChocolateMousseCake, name: "Dark Chocolate Mousse" },
    { img: DutchTruffleCakehalfkg, name: "Dutch Truffle Cake" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white">
{/* 🌟 HERO SECTION WITHOUT VIDEO */}
<section className="w-full text-center py-16 bg-[#0a0f1c]">
  <h1
    className="text-4xl md:text-5xl font-extrabold"
    data-aos="fade-down"
  >
    Welcome to <span className="text-blue-400">BakeHub</span>
  </h1>

  <p className="text-gray-300 mt-3 text-lg" data-aos="fade-up">
    Delicious • Fresh • Daily Baked Cakes
  </p>

  <button
    className="mt-5 px-6 py-3 bg-blue-500 rounded-lg hover:bg-blue-600 text-white"
    data-aos="zoom-in"
  >
    Explore Cakes
  </button>
</section>

{/* 🍰 FULL WIDTH PREMIUM BANNER BELOW HERO */}
<div className="w-full mt-0">
  <img
    src="/images/hero-cake.jpg"
    alt="Premium Cake Banner"
    className="w-full h-[350px] md:h-[500px] object-cover rounded-none"
    data-aos="fade-up"
  />
</div>

      {/* 🎂 Cakes Section (Lag-Free) */}
      <section className="px-6 my-12">
        <h2 className="text-3xl font-bold mb-8" data-aos="fade-right">
          Featured Cakes
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
          {featuredCakes.map((item, index) => (
            <div
              key={index}
              data-aos="fade-up"
              data-aos-delay={index * 60}   // ⬅ small delay, smooth
              className="bg-[#112240]/70 rounded-xl shadow-xl overflow-hidden 
              hover:scale-[1.04] transition-all duration-300"
            >
              {/* Optimized Cake Image */}
              <img
                src={item.img}
                loading="lazy"               // ⬅ reduces lag a LOT
                className="w-full h-64 object-cover"
                alt={item.name}
              />

              <div className="p-4 text-center">
                <h3 className="text-xl font-semibold">{item.name}</h3>
                <button className="mt-3 w-full py-2 bg-blue-500 hover:bg-blue-600 rounded-lg">
                  Order Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#112240] py-6 text-center mt-16">
        <h2 className="text-xl font-bold">BakeHub</h2>
        <p className="text-gray-400 text-sm mt-1">
          © 2025 BakeHub. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}

export default Home;
