import ReviewList from "./ReviewList";
import { useState, useEffect } from "react";
import { getReviews } from "../api";

const LIMIT = 6;

export default function App() {
  const [order, setOrder] = useState("createdAt");
  const [offset, setOffset] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingError, setLoadingError] = useState(null);
  const sortedItems = items.sort((a, b) => b[order] - a[order]);
  
  const handleNewsClick = () => setOrder('createdAt');

  const handleBestClick = () => setOrder('rating');

  const handleDelete = (id) => {
    const nextItems = items.filter((item) => item.id !== id);
    setItems(nextItems);
  }

  const handleLoad = async (options) => {
    let result;
    try{
      setLoadingError(null);
      setIsLoading(true);
      result = await getReviews(options);
    } catch (error) {
      console.error(error);
      setLoadingError(error);
      return;
    } finally {
      setIsLoading(false);
    }

    const { paging, reviews } = result;
    if (options.offset === 0) {
      setItems(reviews);
    } else {
      setItems((prevItems) => {
        return [...prevItems, ...reviews];
      });
    }
    setOffset(options.offset + options.limit);
    setHasNext(paging.hasNext);
  }

  const handleLoadMore = async () => {
    await handleLoad({ order, offset, limit: LIMIT });
  }

  useEffect(() => {
    handleLoad({ order, offset: 0,limit: LIMIT });
  }, [order]);

  return (
    <div>
      <div>
        <button onClick={handleNewsClick}>최신순</button>
        <button onClick={handleBestClick}>평점순</button>
      </div>
      <ReviewList items={sortedItems} onDelete={handleDelete} />
      {hasNext && (
        <button disabled={isLoading} onClick={handleLoadMore}>
        더보기
      </button>
      )}
      {loadingError?.message && <span>{loadingError.message}</span>}
    </div>
  );
}