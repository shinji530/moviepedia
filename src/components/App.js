import ReviewList from "./ReviewList";
import { useCallback, useState, useEffect } from "react";
import { createReview, deletereview, getReviews, updateReview } from "../api";
import ReviewForm from "./ReviewForm";
import useAsync from '../hooks/useAsync';
import LocaleContext from '../contexts/LocaleContext';

const LIMIT = 6;

export default function App() {
  const [order, setOrder] = useState("createdAt");
  const [offset, setOffset] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [items, setItems] = useState([]);
  const [isLoading, loadingError, getReviewsAsync] = useAsync(getReviews);
  const sortedItems = items.sort((a, b) => b[order] - a[order]);
  
  const handleNewsClick = () => setOrder('createdAt');

  const handleBestClick = () => setOrder('rating');

  const handleDelete = async (id) => {
    const result = await deleteReview(id);
    if (!result) return;
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const handleLoad = useCallback(async (options) => {
    const result = await getReviewsAsync(options);
    if (!result) return;

    const { paging, reviews } = result;
    if (options.offset === 0) {
      setItems(reviews);
    } else {
      setItems((prevItems) => [...prevItems, ...reviews]);
    }
    setOffset(options.offset + options.limit);
    setHasNext(paging.hasNext);
  }, [getReviewsAsync]);

  const handleLoadMore = async () => {
    await handleLoad({ order, offset, limit: LIMIT });
  };

  const handleCreateSuccess = (review) => {
    setItems((prevItems) => [review, ...prevItems]);
  };

  const handleUpdateSuccess = (review) => {
    setItems((prevItems) => {
      const splitIdx = prevItems.findIndex((item) => item.id === review.id);
      return [
        ...prevItems.slice(0, splitIdx),
        review,
        ...prevItems.slice(splitIdx + 1),
      ];
    });
  };

  useEffect(() => {
    handleLoad({ order, offset: 0,limit: LIMIT });
  }, [order, handleLoad]);

  return (
    <div>
      <div>
        <button onClick={handleNewsClick}>최신순</button>
        <button onClick={handleBestClick}>평점순</button>
      </div>
      <ReviewForm onSubmit={createReview} onSubmitSuccess={handleCreateSuccess} />
      <ReviewList items={sortedItems} onDelete={handleDelete} onUpdate={updateReview} onUpdateSuccess={handleUpdateSuccess} />
      {hasNext && (
        <button disabled={isLoading} onClick={handleLoadMore}>
        더보기
      </button>
      )}
      {loadingError?.message && <span>{loadingError.message}</span>}
    </div>
  );
}