import React from "react";
import { useAuth } from "../../context/AuthContext";

const WishlistPage = () => {
  const { user } = useAuth();

  return (
    <section className="flex-1 flex flex-col bg-[#161616] overflow-y-auto h-[calc(100vh-56px)] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#3a3a3a] [&::-webkit-scrollbar-thumb]:rounded-full">
      <div className="p-6 max-md:p-4 flex flex-col gap-5 max-w-3xl w-full mx-auto">

        <h1 className="text-[18px] font-bold text-gray-100 border-l-[3px] border-blue-500 pl-3">
          My Wishlist
        </h1>

        {!user ? (
          <p className="text-gray-500 text-sm mt-4">
            Sign in to see your wishlist.
          </p>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 mt-16">
            <span className="text-[52px]">🔖</span>
            <p className="text-gray-400 text-[15px]">Your wishlist is empty.</p>
            <p className="text-gray-500 text-[13px]">
              Browse books and click <strong className="text-gray-300">Add to Wishlist</strong> to save them here.
            </p>
          </div>
        )}

      </div>
    </section>
  );
};

export default WishlistPage;
