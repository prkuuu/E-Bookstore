import React, { useState } from "react";
import "./index.css";

const StarRating = ({ value, interactive = false, onChange }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <span className="stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`star ${n <= (interactive ? hovered || value : value) ? "star--filled" : ""}`}
          onMouseEnter={() => interactive && setHovered(n)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onChange && onChange(n)}
        >
          ★
        </span>
      ))}
    </span>
  );
};

const RelatedCard = ({ book, onClick }) => (
  <div className="related-card" onClick={onClick}>
    <div className="related-card__cover" style={{ backgroundColor: book.cover }}>
      <span className="related-card__initials">{book.initials}</span>
    </div>
    <div className="related-card__info">
      <h4 className="related-card__title">{book.title}</h4>
      <p className="related-card__author">by <a href="#" className="link">{book.author}</a></p>
      <p className="related-card__desc">{book.description}</p>
      <p className="related-card__format">{book.format}</p>
      <p className="related-card__tags">
        {book.tags.map((t, i) => (
          <span key={t}>
            <a href="#" className="link">{t}</a>
            {i < book.tags.length - 1 && <span className="muted">, </span>}
          </span>
        ))}
      </p>
      <p className="related-card__price">&#8377;{book.price}</p>
      <p className="related-card__delivery">Delivery by <strong>{book.delivery}</strong></p>
    </div>
  </div>
);

const BookDetail = ({ book, allBooks = [], onBack, onBookSelect }) => {
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [cartAdded, setCartAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const related = allBooks.filter(
    (b) => b.id !== book.id && b.tags.some((t) => book.tags.includes(t))
  ).slice(0, 3);

  const handleAddToCart = () => {
    setCartAdded(true);
    setTimeout(() => setCartAdded(false), 1500);
  };

  return (
    <div className="detail">
      {/* ── Breadcrumb ── */}
      <nav className="detail__breadcrumb">
        <button className="detail__crumb-btn" onClick={onBack}>Home</button>
        <span className="detail__crumb-sep">/</span>
        <span className="detail__crumb">{book.tags[0] || "Books"}</span>
        <span className="detail__crumb-sep">/</span>
        <span className="detail__crumb detail__crumb--active">{book.title}</span>
      </nav>

      <div className="detail__layout">
        {/* ════ LEFT + CENTRE ════ */}
        <div className="detail__main">

          {/* ── Top: cover + info ── */}
          <div className="detail__hero">
            {/* Cover */}
            <div className="detail__cover-wrap">
              <div className="detail__cover" style={{ backgroundColor: book.cover }}>
                <span className="detail__cover-initials">{book.initials}</span>
              </div>
            </div>

            {/* Info panel */}
            <div className="detail__info">
              <h1 className="detail__title">{book.title}</h1>
              <p className="detail__author">by <a href="#" className="link">{book.author}</a></p>
              <p className="detail__desc">{book.description}</p>
              <p className="detail__publisher">
                Published by: <a href="#" className="link">{book.publisher}</a>
              </p>
              <p className="detail__format">{book.format}</p>
              <p className="detail__tags">
                {book.tags.map((t, i) => (
                  <span key={t}>
                    <a href="#" className="link">{t}</a>
                    {i < book.tags.length - 1 && <span className="muted">, </span>}
                  </span>
                ))}
              </p>

              <p className="detail__price">&#8377;{book.price}</p>
              <p className="detail__delivery">Delivery by <strong>{book.delivery}</strong></p>

              {/* Actions */}
              <div className="detail__actions">
                <button
                  className={`detail__btn detail__btn--primary ${cartAdded ? "detail__btn--added" : ""}`}
                  onClick={handleAddToCart}
                >
                  {cartAdded ? "✓ Added" : "Add to Cart"} <span className="detail__btn-icon">🛒</span>
                </button>
                <button
                  className={`detail__btn detail__btn--secondary ${wishlisted ? "detail__btn--wishlisted" : ""}`}
                  onClick={() => setWishlisted((w) => !w)}
                >
                  {wishlisted ? "✓ Wishlisted" : "Add to Wishlist"} <span className="detail__btn-icon">🔖</span>
                </button>
              </div>

              {/* Meta row */}
              <div className="detail__meta">
                <div className="detail__meta-item">
                  <span className="detail__meta-label">Language</span>
                  <a href="#" className="link">{book.language}</a>
                </div>
                <div className="detail__meta-divider" />
                <div className="detail__meta-item">
                  <span className="detail__meta-label">Rating</span>
                  <StarRating value={book.rating} />
                </div>
                <div className="detail__meta-divider" />
                <div className="detail__meta-item">
                  <span className="detail__meta-label">Sells</span>
                  <span className="detail__meta-value">{book.sells} copies sold</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── About the writer ── */}
          <div className="detail__section">
            <h2 className="detail__section-title">About the writer</h2>
            <div className="detail__author-row">
              <div className="detail__author-avatar">
                {book.author.split(" ").map((w) => w[0]).join("")}
              </div>
              <div className="detail__author-info">
                <h3 className="detail__author-name">{book.author}</h3>
                <p className="detail__author-bio">{book.about}</p>
              </div>
            </div>
          </div>

          {/* ── Reviews ── */}
          <div className="detail__section">
            <h2 className="detail__section-title">Reviews</h2>

            {/* Write a review */}
            <div className="detail__review-write">
              <div className="detail__review-header">
                <span className="detail__review-heading">Leave Your Review</span>
                <span className="detail__review-counter">{reviewText.length}/100</span>
              </div>
              <textarea
                className="detail__review-input"
                placeholder="Placeholder text"
                maxLength={100}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />
              <div className="detail__review-footer">
                <StarRating value={reviewRating} interactive onChange={setReviewRating} />
                <button className="detail__submit-btn">
                  Submit <span>→</span>
                </button>
              </div>
            </div>

            {/* Existing reviews */}
            {book.reviews.map((rev, i) => (
              <div key={i} className="detail__review-item">
                <div className="detail__review-meta">
                  <strong className="detail__reviewer">{rev.name}</strong>
                  <StarRating value={rev.rating} />
                </div>
                <p className="detail__review-text">{rev.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ════ RIGHT: Related Reads ════ */}
        <aside className="detail__related">
          <h2 className="detail__related-title">Related Reads</h2>
          <div className="detail__related-list">
            {related.length > 0 ? related.map((rb) => (
              <RelatedCard key={rb.id} book={rb} onClick={() => onBookSelect(rb)} />
            )) : (
              <p className="muted" style={{ fontSize: 13 }}>No related books found.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default BookDetail;
