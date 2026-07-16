import React from "react";
import { useAuth } from "../../context/AuthContext";

const WritersPage = () => {
  const { user } = useAuth();

  return (
    <section className="flex-1 flex flex-col bg-[#161616] overflow-y-auto h-[calc(100vh-56px)] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#3a3a3a] [&::-webkit-scrollbar-thumb]:rounded-full">
      <div className="p-6 max-md:p-4 flex flex-col gap-5 max-w-3xl w-full mx-auto">

        <h1 className="text-[18px] font-bold text-gray-100 border-l-[3px] border-blue-500 pl-3">
          My Writers
        </h1>

        {!user ? (
          <p className="text-gray-500 text-sm mt-4">
            Sign in to follow your favourite writers.
          </p>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 mt-16">
            <span className="text-[52px]">✍️</span>
            <p className="text-gray-400 text-[15px]">You haven't followed any writers yet.</p>
            <p className="text-gray-500 text-[13px]">
              Open a book detail page and follow the author to track their new releases here.
            </p>
          </div>
        )}

      </div>
    </section>
  );
};

export default WritersPage;
