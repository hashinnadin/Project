import React from "react";
import Navbar from "../compenent/Navbar/Navbar";

import {
  cake1,
  cake2,
  cake3,
  cake4,
  cake5,
  cake6,
  cake7,
  cake8,
  Butterscotch_MilkChocolateCake,
  Chocolate_StrawberryBentoCake,
  DarkChocolateMousseCake,
  DutchTruffleCakehalfkg,
  EgglessDutchTruffleCakehalfkg,
  EgglessDutchTruffleCakeonekg,
  FreshFruit_CreamCake,
  HIGHRESBlueberryCheesecake,
  NewYorkCheeseCake1,
  RedVelvetCakehalfkg,
  StrawberryCustardCake,
} from "../assets";

function Product() {
  const cakes = [
    { img: cake1, name: "Chocolate Cake" },
    { img: cake2, name: "Strawberry Cake" },
    { img: cake3, name: "Vanilla Cake" },
    { img: cake4, name: "Party Mix Cake" },
    { img: cake5, name: "Creamy Delight" },
    { img: cake6, name: "Special Chocolate" },
    { img: cake7, name: "Fruit Special" },
    { img: cake8, name: "Premium Cake" },
    { img: Butterscotch_MilkChocolateCake, name: "Butterscotch MilkChoco" },
    { img: Chocolate_StrawberryBentoCake, name: "Choco Strawberry Bento" },
    { img: DarkChocolateMousseCake, name: "Dark Chocolate Mousse" },
    { img: DutchTruffleCakehalfkg, name: "Dutch Truffle Cake" },
    { img: EgglessDutchTruffleCakehalfkg, name: "Eggless Truffle Cake" },
    { img: EgglessDutchTruffleCakeonekg, name: "Eggless Truffle 1KG" },
    { img: FreshFruit_CreamCake, name: "Fresh Fruit Cream Cake" },
    { img: HIGHRESBlueberryCheesecake, name: "Blueberry Cheesecake" },
    { img: NewYorkCheeseCake1, name: "NY Cheesecake" },
    { img: RedVelvetCakehalfkg, name: "Red Velvet" },
    { img: StrawberryCustardCake, name: "Strawberry Custard" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white">
      

      <div className="p-6">
        <h1 className="text-3xl font-bold mb-8">Our Cakes</h1>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {cakes.map((item, index) => (
            <div
              key={index}
              className="p-3 bg-[#112240]/60 rounded-xl shadow-lg hover:scale-105 duration-300"
            >
              <img
                src={item.img}
                className="w-full h-40 object-cover rounded-lg"
                alt={item.name}
              />
              <h3 className="text-lg font-semibold mt-2">{item.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Product;
