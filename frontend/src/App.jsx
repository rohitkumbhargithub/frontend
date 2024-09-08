import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import './App.css';

Modal.setAppElement('#root'); // For accessibility

function App() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [popularityRange, setPopularityRange] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(20);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:8000/api/product')
      .then((response) => {
        const productsArray = Object.keys(response.data.products).map(key => ({
          id: key,
          ...response.data.products[key]
        }));
        setData(productsArray);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const isWithinRange = (value, range) => {
    const [min, max] = range.split('-').map(Number);
    return max ? value >= min && value <= max : value >= min;
  };

  const filterAndPaginateProducts = () => {
    const lowerCaseSearch = search.toLowerCase();

    let filtered = data.filter(product => {
      const { title, subcategory, price, popularity } = product;

      const matchesSearch = (
        lowerCaseSearch === '' ||
        title.toLowerCase().includes(lowerCaseSearch) ||
        subcategory.toLowerCase().includes(lowerCaseSearch)
      );

      const matchesPriceRange = priceRange
        ? isWithinRange(Number(price), priceRange)
        : true;

      const matchesPopularityRange = popularityRange
        ? isWithinRange(Number(popularity), popularityRange)
        : true;

      return matchesSearch && matchesPriceRange && matchesPopularityRange;
    });

    switch (sortOption) {
      case 'price-asc':
        filtered = filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered = filtered.sort((a, b) => b.price - a.price);
        break;
      case 'popularity-asc':
        filtered = filtered.sort((a, b) => a.popularity - b.popularity);
        break;
      case 'popularity-desc':
        filtered = filtered.sort((a, b) => b.popularity - a.popularity);
        break;
      default:
        break;
    }

    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const filteredProducts = filterAndPaginateProducts();
  const totalPages = Math.ceil(data.length / productsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const openModal = (product) => {
    setSelectedProduct(product);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div className="App">
      <input 
        type="text" 
        onChange={(e) => setSearch(e.target.value)} 
        placeholder='Search Products'
      />
      <select onChange={(e) => setPriceRange(e.target.value)} value={priceRange}>
        <option value="">All Price Ranges</option>
        <option value="0-5000">0 - 5000</option>
        <option value="5000-10000">5000 - 10000</option>
        <option value="10000-20000">10000 - 20000</option>
        <option value="20000-">20000+</option>
      </select>
      <select onChange={(e) => setPopularityRange(e.target.value)} value={popularityRange}>
        <option value="">All Popularity Ranges</option>
        <option value="0-10000">0 - 10000</option>
        <option value="10000-30000">10000 - 30000</option>
        <option value="30000-50000">30000 - 50000</option>
        <option value="50000-">50000+</option>
      </select>
      <select onChange={(e) => setSortOption(e.target.value)} value={sortOption}>
        <option value="">Sort By</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="popularity-asc">Popularity: Low to High</option>
        <option value="popularity-desc">Popularity: High to Low</option>
      </select>
      {filteredProducts && filteredProducts.length > 0 ? (
        filteredProducts.map((product) => (
          <div 
            key={product.id} 
            onClick={() => openModal(product)} 
            className="product-item"
          >
            <h3>{product.title}</h3>
            <p>Category: {product.subcategory}</p>
            <p>Price: {product.price}</p>
            <p>Popularity: {product.popularity}</p>
          </div>
        ))
      ) : (
        <div>No products available</div>
      )}
      <div className="pagination-controls">
        <button 
          onClick={() => handlePageChange(currentPage - 1)} 
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button 
          onClick={() => handlePageChange(currentPage + 1)} 
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
      {selectedProduct && (
        <Modal 
          isOpen={modalIsOpen} 
          onRequestClose={closeModal} 
          contentLabel="Product Details"
          className="modal"
          overlayClassName="overlay"
        >
          <h2>{selectedProduct.title}</h2>
          <p>Price: {selectedProduct.price}</p>
          <p>Popularity: {selectedProduct.popularity}</p>
          <p>Description: {selectedProduct.description || 'No description available.'}</p>
          <button onClick={closeModal}>Close</button>
        </Modal>
      )}
    </div>
  );
}

export default App;
