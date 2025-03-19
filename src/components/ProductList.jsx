import React, { useEffect, useRef } from 'react';
import ProductCard from './ProductCard';

function ProductList({ 
  products, 
  loading, 
  loadingMore, 
  hasMore, 
  onLoadMore,
  onAddToCart,
  onRemoveFromCart,
  isProductInCart 
}) {
  const observerRef = useRef();
  const sentinelRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !loadingMore && hasMore) {
          onLoadMore();
        }
      },
      { threshold: 0.5 }
    );

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, loadingMore, hasMore, onLoadMore]);

  useEffect(() => {
    if (sentinelRef.current && observerRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }
  }, [products]);

  if (loading && !loadingMore && products.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => (
        <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
          <ProductCard 
            product={product} 
            onAddToCart={onAddToCart}
            onRemoveFromCart={onRemoveFromCart}
            isInCart={isProductInCart(product.id)}
          />
        </div>
      ))}

      {/* Elemento sentinel para la carga infinita */}
      {hasMore && (
        <div 
          ref={sentinelRef}
          className="col-span-full flex justify-center py-4"
        >
          {loadingMore && (
            <div className="flex items-center space-x-2">
              <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-gray-500">Cargando más productos...</span>
            </div>
          )}
        </div>
      )}

      {!loading && !loadingMore && products.length === 0 && (
        <div className="col-span-full text-center py-8 text-gray-500">
          No se encontraron productos.
        </div>
      )}
    </div>
  );
}

export default ProductList;