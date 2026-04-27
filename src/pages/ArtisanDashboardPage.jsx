import React, { useEffect, useState } from 'react';
import API, { initialArtisanOrders } from '../api/API';
import '../styles/ArtisanDashboardPage.css';
import { fallbackProductImage, normalizeProduct } from '../utils/productUtils';

const defaultListingForm = {
  name: '',
  category: '',
  stock: '',
  price: '',
  description: ''
  
};

const initialCustomerMessages = [
  {
    customer: 'Anita Verma',
    topic: 'Custom delivery note',
    message: 'Please confirm if the painting can include a gift note before dispatch.',
    status: 'Needs Reply'
  },
  {
    customer: 'Kiran Rao',
    topic: 'Care instructions',
    message: 'Asked how to preserve natural-dyed textile colors after delivery.',
    status: 'Replied'
  }
];

function ArtisanDashboardPage() {
  const [artisanProducts, setArtisanProducts] = useState([]);
  const [listingForm, setListingForm] = useState(defaultListingForm);
  const [editingProductId, setEditingProductId] = useState(null);
  const [listingNotice, setListingNotice] = useState('');
  const [isListingLoading, setIsListingLoading] = useState(false);
  const [artisanOrders, setArtisanOrders] = useState(initialArtisanOrders);
  const [messages, setMessages] = useState(initialCustomerMessages);
  const [ordersNotice, setOrdersNotice] = useState('');
  const [messagesNotice, setMessagesNotice] = useState('');

  const isEditingListing = editingProductId !== null;

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      setIsListingLoading(true);

      try {
        const response = await API.get('/Product/all');
        const nextProducts = Array.isArray(response.data)
          ? response.data.map(normalizeProduct)
          : [];

        if (isMounted) {
          setArtisanProducts(nextProducts);
          setListingNotice('');
        }
      } catch {
        if (isMounted) {
          setListingNotice('Unable to load products from the database. Start the backend to manage listings.');
        }
      } finally {
        if (isMounted) {
          setIsListingLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  function handleListingFieldChange(event) {
    const { name, value } = event.target;

    setListingForm((current) => ({
      ...current,
      [name]: value
    }));
  }

  const resetListingForm = () => {
    setListingForm(defaultListingForm);
    setEditingProductId(null);
  };

  const handleAddProductClick = () => {
    resetListingForm();
    setListingNotice('Fill the product details, then save the new listing.');
  };

  const handleEditProductClick = (product) => {
    setEditingProductId(product.id);
    setListingForm({
      name: product.name,
      category: product.category,
      stock: String(product.stock),
      price: String(product.price),
      description: product.description || ''
    });
    setListingNotice(`Updating ${product.name}.`);
  };

  const handleDeleteProductClick = async (product) => {
    setIsListingLoading(true);

    try {
      await API.delete(`/Product/${product.id}`);
      setArtisanProducts((currentProducts) => currentProducts.filter((currentProduct) => currentProduct.id !== product.id)
      );

      if (editingProductId === product.id) {
        resetListingForm();
      }

      setListingNotice(`${product.name} deleted successfully.`);
    } catch {
      setListingNotice(`Unable to delete ${product.name}. Please check the backend connection.`);
    } finally {
      setIsListingLoading(false);
    }
  };

  const handleManageAllOrdersClick = () => {
    setArtisanOrders((currentOrders) => currentOrders.map((order) => ({
      ...order,
      status: order.status === 'Delivered' ? order.status : 'Preparing Order'
    }))
    );
    setOrdersNotice('Active orders marked as Preparing Order.');
  };

  const handleReplyMessagesClick = () => {
    setMessages((currentMessages) => currentMessages.map((message) => ({
      ...message,
      status: 'Replied'
    }))
    );
    setMessagesNotice('Customer messages marked as replied.');
  };

  const handleListingSubmit = async (event) => {
    event.preventDefault();

    const currentProduct = artisanProducts.find((product) => product.id === editingProductId);

    const nextProductDetails = {
      name: listingForm.name.trim(),
      productname: listingForm.name.trim(),
      category: listingForm.category.trim(),
      stock: Number(listingForm.stock),
      quantity: Number(listingForm.stock),
      price: Number(listingForm.price),
      description: listingForm.description.trim(),
      artisan: currentProduct?.artisan || 'Your Artisan Studio',
      image: currentProduct?.image || fallbackProductImage,
      culturalNotes: currentProduct?.culturalNotes || 'Updated by artisan dashboard',
      rating: currentProduct?.rating || 0
    };

    setIsListingLoading(true);

    try {
      if (isEditingListing) {
        const response = await API.put(`/Product/${editingProductId}`, nextProductDetails);
        const updatedProduct = normalizeProduct(response.data);

        setArtisanProducts((currentProducts) => currentProducts.map((product) => product.id === editingProductId
          ? { ...product, ...updatedProduct }
          : product
        )
        );
        setListingNotice('Product listing updated successfully.');
      } else {
        const response = await API.post('/Product', nextProductDetails);
        const createdProduct = normalizeProduct(response.data);

        setArtisanProducts((currentProducts) => [...currentProducts, createdProduct]);
        setListingNotice('New product listing added successfully.');
      }

      resetListingForm();
    } catch {
      setListingNotice('Unable to save this product to the database. Please check the backend connection.');
    } finally {
      setIsListingLoading(false);
    }
  };

  return (
    <section className="artisan-page">
      <div className="artisan-shell">
        <div className="artisan-dashboard-grid">
          <article className="artisan-panel-card">
            <div className="artisan-panel-heading">
              <h2>Product Listings</h2>
              <button type="button" onClick={handleAddProductClick}>Add Product</button>
            </div>

            <form className="artisan-listing-form" onSubmit={handleListingSubmit}>
              <div className="artisan-form-grid">
                <label>
                  Product Name
                  <input
                    type="text"
                    name="name"
                    value={listingForm.name}
                    onChange={handleListingFieldChange}
                    placeholder="Handwoven basket"
                    required />
                </label>

                <label>
                  Category
                  <input
                    type="text"
                    name="category"
                    value={listingForm.category}
                    onChange={handleListingFieldChange}
                    placeholder="Textiles"
                    required />
                </label>

                <label>
                  Stock
                  <input
                    type="number"
                    name="stock"
                    value={listingForm.stock}
                    onChange={handleListingFieldChange}
                    min="0"
                    placeholder="5"
                    required />
                </label>

                <label>
                  Price
                  <input
                    type="number"
                    name="price"
                    value={listingForm.price}
                    onChange={handleListingFieldChange}
                    min="0"
                    step="0.01"
                    placeholder="89.99"
                    required />
                </label>

                <label className="artisan-form-wide">
                  Description
                  <textarea
                    name="description"
                    value={listingForm.description}
                    onChange={handleListingFieldChange}
                    placeholder="Short product details for customers"
                    rows="3"
                    required />
                </label>
              </div>

              <div className="artisan-form-actions">
                <button type="submit" disabled={isListingLoading}>
                  {isEditingListing ? 'Save Update' : 'Add Product'}
                </button>
                {isEditingListing ? (
                  <button type="button" className="artisan-secondary-button" onClick={resetListingForm}>
                    Cancel
                  </button>
                ) : null}
              </div>

              {listingNotice ? <p className="artisan-listing-notice">{listingNotice}</p> : null}
            </form>

            <div className="artisan-table-wrap">
              {isListingLoading ? <p className="artisan-loading-text">Updating product listings...</p> : null}
              <table className="artisan-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Stock</th>
                    <th>Price</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {artisanProducts.length > 0 ? (
                    artisanProducts.map((product) => (
                      <tr key={product.id}>
                        <td>{product.name}</td>
                        <td>{product.category}</td>
                        <td>{product.stock}</td>
                        <td>Rs {product.price}</td>
                        <td>
                          <div className="artisan-table-actions">
                            <button type="button" onClick={() => handleEditProductClick(product)}>Update</button>
                            <button
                              type="button"
                              className="artisan-delete-button"
                              disabled={isListingLoading}
                              onClick={() => handleDeleteProductClick(product)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5">No products found in the database yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>

          <article className="artisan-panel-card">
            <div className="artisan-panel-heading">
              <h2>Orders</h2>
              <button type="button" onClick={handleManageAllOrdersClick}>Manage All</button>
            </div>
            <div className="artisan-order-list">
              {artisanOrders.map((order) => (
                <div className="artisan-order-item" key={`${order.orderId}-${order.productId}`}>
                  <div>
                    <p>{order.orderId}</p>
                    <strong>{order.product.name}</strong>
                    <span>{order.quantity} item placed on {order.placedAt}</span>
                  </div>
                  <span className="artisan-status-badge">{order.status}</span>
                </div>
              ))}
            </div>
            {ordersNotice ? <p className="artisan-listing-notice">{ordersNotice}</p> : null}
          </article>

          <article className="artisan-panel-card artisan-messages-card">
            <div className="artisan-panel-heading">
              <h2>Customer Messages</h2>
              <button type="button" onClick={handleReplyMessagesClick}>Reply</button>
            </div>
            <div className="artisan-message-list">
              {messages.map((message) => (
                <div className="artisan-message-item" key={message.topic}>
                  <div>
                    <p>{message.customer}</p>
                    <strong>{message.topic}</strong>
                    <span>{message.message}</span>
                  </div>
                  <span>{message.status}</span>
                </div>
              ))}
            </div>
            {messagesNotice ? <p className="artisan-listing-notice">{messagesNotice}</p> : null}
          </article>
        </div>
      </div>
    </section>
  );
}

export default ArtisanDashboardPage;
