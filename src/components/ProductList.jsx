import React from 'react';
import ProductCard from './ProductCard';

function ProductList({ products, loading, onAddToCart, onRemoveFromCart, isProductInCart }) {
  if (loading) {
    return (
      <div className="col-span-full flex justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 my-6">
      {products.length > 0 ? (
        products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onAddToCart={onAddToCart}
            onRemoveFromCart={onRemoveFromCart}
            isInCart={isProductInCart(product.id)}
          />
        ))
      ) : (
        <div className="col-span-full text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No se encontraron productos</h3>
          <p className="mt-1 text-gray-500">Intenta con otra búsqueda o cambia la categoría seleccionada.</p>
        </div>
      )}
    </div>
  );
}

export default ProductList;