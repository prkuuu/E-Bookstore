import React, { memo } from "react";
import BookCover from "../BookCover";

const BookCard = memo(({ book, onClick }) => {
  const { title, author, format, price, delivery, cover, coverUrl, initials } = book;

  return (
    <div
      className={`flex gap-3 bg-[#262626] border border-[#3a3a3a] rounded-md p-3 w-full transition-colors duration-150 hover:border-[#555] ${onClick ? "cursor-pointer" : "cursor-default"}`}
      role="button"
      onClick={onClick}
    >
      {/* Cover */}
      <BookCover
        coverUrl={coverUrl}
        cover={cover}
        initials={initials}
        className="w-14 h-[76px] rounded shrink-0"
      />

      {/* Info */}
      <div className="flex flex-col gap-0.5 min-w-0">
        <h3 className="text-[13px] font-semibold text-gray-100 leading-[1.35] whitespace-nowrap overflow-hidden text-ellipsis">
          {title}
        </h3>
        <p className="text-[12px] text-gray-400">
          by <span className="text-blue-400">{author}</span>
        </p>
        <p className="text-[11px] text-gray-400 mt-0.5">{format}</p>
        {/* <p className="text-[11px] mt-px">
          {tags.map((tag, i) => (
            i > 0 && <span key={`sep-${i}`} className="text-gray-500">, </span>,
              <a key={tag}  href="#" className="text-blue-400 no-underline hover:underline">{tag}</a>           
          ))}
        </p> */}
        <p className="text-[14px] font-bold text-gray-100 mt-1">&#8377;{price}</p>
        <p className="text-[11px] text-gray-400">
          Delivery by <strong className="text-gray-300">{delivery}</strong>
        </p>
      </div>
    </div>
  );
});

BookCard.displayName = "BookCard";
export default BookCard;
