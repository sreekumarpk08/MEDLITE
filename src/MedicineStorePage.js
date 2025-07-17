import React, { useState, useEffect } from 'react';
import './MedicineStore.css';

const MedicineStore = () => {
  // Authentication states
  const [authMode, setAuthMode] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [showOtpField, setShowOtpField] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Tab management
  const [activeTab, setActiveTab] = useState('products');

  // Product Management states
  const [products, setProducts] = useState([]);
  const [productForm, setProductForm] = useState({
    productName: '',
    genericName: '',
    manufacturer: '',
    marketingCompany: '',
    purchaseAccount: '',
    salesAccount: '',
    drugSchedule: '',
    mrp: '',
    rate: '',
    gstRate: '12',
    rackNo: '',
    hsnCode: '',
    batchNo: '',
    expiryDate: '',
    ptr: '',
    unit: '',
    mrpInclusive: true,
    supplier: '',
    stock: ''
  });

  // Sales Billing states
  const [salesForm, setSalesForm] = useState({
    billNumber: '',
    billDate: new Date().toLocaleDateString('en-GB'),
    doctorName: '',
    patientName: '',
    cashCredit: 'Cash',
    discountPercent: 0,
    discountAmount: 0,
    items: [{
      productName: '',
      batchNo: '',
      expiryDate: '',
      quantity: 1,
      rate: 0,
      pack: 1,
      amount: 0,
      gstPercent: 0,
      discountPercent: 0,
      gstAmount: 0,
      cess: false
    }],
    netTotal: 0,
    totalGst: 0,
    totalDiscount: 0,
    grandTotal: 0
  });

  // Generate OTP
  const generateOtp = () => {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(otp);
    alert(`Your OTP is ${otp}`); // Replace with SMS service in production
    setShowOtpField(true);
  };

  // Handle auth initiation (send OTP)
  const handleAuthInit = (e) => {
    e.preventDefault();
    if (!phone) {
      alert('Please enter phone number');
      return;
    }
    generateOtp();
  };

  // Verify OTP
  const verifyOtp = (e) => {
    e.preventDefault();
    if (otp !== generatedOtp) {
      alert('Invalid OTP');
      return;
    }

    const users = JSON.parse(localStorage.getItem('pharmacyUsers')) || [];
    let user = users.find(u => u.phone === phone);

    if (authMode === 'signup' && !user) {
      user = {
        id: Date.now(),
        phone,
        pharmacyName: 'New Pharmacy',
        licenseNumber: 'TEMP123'
      };
      localStorage.setItem('pharmacyUsers', JSON.stringify([...users, user]));
    }

    if (user) {
      localStorage.setItem('currentPharmacyUser', JSON.stringify(user));
      setCurrentUser(user);
      setIsAuthenticated(true);
    } else {
      alert('User not found. Please sign up.');
      setAuthMode('signup');
      setShowOtpField(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('currentPharmacyUser');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setAuthMode('login');
    setPhone('');
    setOtp('');
    setShowOtpField(false);
  };

  // Calculate PTR
  const calculatePTR = () => {
    const { mrp, gstRate } = productForm;
    if (mrp && gstRate) {
      const ptrValue = parseFloat(mrp) / (1 + (parseFloat(gstRate) / 100));
      setProductForm({...productForm, ptr: ptrValue.toFixed(2)});
    }
  };

  // Handle product form changes
  const handleProductChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductForm({
      ...productForm,
      [name]: type === 'checkbox' ? checked : value
    });
    
    if (name === 'mrp' || name === 'gstRate') {
      calculatePTR();
    }
  };

  // Save product
  const saveProduct = () => {
    const newProduct = { ...productForm, id: Date.now() };
    setProducts([...products, newProduct]);
    setProductForm({
      productName: '',
      genericName: '',
      manufacturer: '',
      marketingCompany: '',
      purchaseAccount: '',
      salesAccount: '',
      drugSchedule: '',
      mrp: '',
      rate: '',
      gstRate: '12',
      rackNo: '',
      hsnCode: '',
      batchNo: '',
      expiryDate: '',
      ptr: '',
      unit: '',
      mrpInclusive: true,
      supplier: '',
      stock: ''
    });
    alert('Product saved successfully!');
  };

  // Handle sales form changes
  const handleSalesChange = (e, index) => {
    const { name, value, type, checked } = e.target;
    const updatedItems = [...salesForm.items];
    
    updatedItems[index] = {
      ...updatedItems[index],
      [name]: type === 'checkbox' ? checked : value
    };
    
    // Recalculate amounts
    if (['quantity', 'rate', 'gstPercent', 'discountPercent'].includes(name)) {
      const item = updatedItems[index];
      item.amount = item.quantity * item.rate;
      item.gstAmount = item.amount * (item.gstPercent / 100);
      item.discountAmount = item.amount * (item.discountPercent / 100);
    }
    
    // Calculate totals
    const netTotal = updatedItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    const totalGst = updatedItems.reduce((sum, item) => sum + (item.gstAmount || 0), 0);
    const totalDiscount = updatedItems.reduce((sum, item) => sum + (item.discountAmount || 0), 0);
    const grandTotal = netTotal + totalGst - totalDiscount;
    
    setSalesForm({
      ...salesForm,
      items: updatedItems,
      netTotal,
      totalGst,
      totalDiscount,
      grandTotal
    });
  };

  // Add new item to sales
  const addNewItem = () => {
    setSalesForm({
      ...salesForm,
      items: [
        ...salesForm.items,
        {
          productName: '',
          batchNo: '',
          expiryDate: '',
          quantity: 1,
          rate: 0,
          pack: 1,
          amount: 0,
          gstPercent: 0,
          discountPercent: 0,
          gstAmount: 0,
          cess: false
        }
      ]
    });
  };

  // Remove item from sales
  const removeItem = (index) => {
    const updatedItems = salesForm.items.filter((_, i) => i !== index);
    setSalesForm({
      ...salesForm,
      items: updatedItems
    });
  };

  // Render authentication form
  if (!isAuthenticated) {
    return (
      <div className="auth-container">
        <h2>{authMode === 'login' ? 'Pharmacy Login' : 'Pharmacy Registration'}</h2>
        
        <form onSubmit={showOtpField ? verifyOtp : handleAuthInit}>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter 10-digit mobile number"
              required
              disabled={showOtpField}
            />
          </div>

          {showOtpField && (
            <div className="form-group">
              <label>Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 4-digit OTP"
                required
                maxLength={4}
              />
              <p className="otp-resend" onClick={generateOtp}>
                Resend OTP
              </p>
            </div>
          )}

          <button type="submit" className="btn-primary">
            {showOtpField ? 'Verify OTP' : (authMode === 'login' ? 'Send OTP' : 'Register')}
          </button>

          {!showOtpField && (
            <p className="auth-toggle">
              {authMode === 'login' 
                ? "New pharmacy? " 
                : "Already registered? "}
              <span onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}>
                {authMode === 'login' ? 'Sign up' : 'Login'}
              </span>
            </p>
          )}
        </form>
      </div>
    );
  }

  // Render product management tab
  const renderProductsTab = () => (
    <div className="tab-content">
      <div className="form-section">
        <h3>Product Details</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Product Name*</label>
            <input
              type="text"
              name="productName"
              value={productForm.productName}
              onChange={handleProductChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Generic Name*</label>
            <input
              type="text"
              name="genericName"
              value={productForm.genericName}
              onChange={handleProductChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Manufacturer*</label>
            <input
              type="text"
              name="manufacturer"
              value={productForm.manufacturer}
              onChange={handleProductChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Marketing Company</label>
            <input
              type="text"
              name="marketingCompany"
              value={productForm.marketingCompany}
              onChange={handleProductChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>HSN Code*</label>
            <input
              type="text"
              name="hsnCode"
              value={productForm.hsnCode}
              onChange={handleProductChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Drug Schedule</label>
            <input
              type="text"
              name="drugSchedule"
              value={productForm.drugSchedule}
              onChange={handleProductChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>MRP (₹)*</label>
            <input
              type="number"
              name="mrp"
              value={productForm.mrp}
              onChange={handleProductChange}
              required
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label>Rate (₹)*</label>
            <input
              type="number"
              name="rate"
              value={productForm.rate}
              onChange={handleProductChange}
              required
              step="0.01"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>GST Rate (%)*</label>
            <input
              type="number"
              name="gstRate"
              value={productForm.gstRate}
              onChange={handleProductChange}
              required
            />
          </div>
          <div className="form-group">
            <label>PTR (₹)</label>
            <input
              type="number"
              name="ptr"
              value={productForm.ptr}
              readOnly
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Batch No*</label>
            <input
              type="text"
              name="batchNo"
              value={productForm.batchNo}
              onChange={handleProductChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Expiry Date</label>
            <input
              type="date"
              name="expiryDate"
              value={productForm.expiryDate}
              onChange={handleProductChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Rack No</label>
            <input
              type="text"
              name="rackNo"
              value={productForm.rackNo}
              onChange={handleProductChange}
            />
          </div>
          <div className="form-group">
            <label>Stock</label>
            <input
              type="number"
              name="stock"
              value={productForm.stock}
              onChange={handleProductChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Unit</label>
            <input
              type="text"
              name="unit"
              value={productForm.unit}
              onChange={handleProductChange}
            />
          </div>
          <div className="form-group">
            <label>Supplier</label>
            <input
              type="text"
              name="supplier"
              value={productForm.supplier}
              onChange={handleProductChange}
            />
          </div>
        </div>

        <div className="form-checkbox">
          <input
            type="checkbox"
            name="mrpInclusive"
            checked={productForm.mrpInclusive}
            onChange={handleProductChange}
            id="mrpInclusive"
          />
          <label htmlFor="mrpInclusive">MRP Inclusive of Tax</label>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-save" onClick={saveProduct}>
            Save (F12)
          </button>
          <button type="button" className="btn-clear">
            Clear
          </button>
        </div>
      </div>

      <div className="product-list">
        <h3>Product Inventory</h3>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Batch No</th>
                <th>MRP</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={index}>
                  <td>{product.productName}</td>
                  <td>{product.batchNo}</td>
                  <td>₹{product.mrp}</td>
                  <td>{product.stock}</td>
                  <td>
                    <button 
                      className="btn-edit"
                      onClick={() => setProductForm(product)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => {
                        setProducts(products.filter((_, i) => i !== index));
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Render sales billing tab
  const renderSalesTab = () => (
    <div className="tab-content">
      <div className="sales-header">
        <div className="form-row">
          <div className="form-group">
            <label>Bill Number</label>
            <input
              type="text"
              name="billNumber"
              value={salesForm.billNumber}
              onChange={(e) => setSalesForm({...salesForm, billNumber: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Bill Date</label>
            <input
              type="text"
              name="billDate"
              value={salesForm.billDate}
              readOnly
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Doctor's Name</label>
            <input
              type="text"
              name="doctorName"
              value={salesForm.doctorName}
              onChange={(e) => setSalesForm({...salesForm, doctorName: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Patient's Name</label>
            <input
              type="text"
              name="patientName"
              value={salesForm.patientName}
              onChange={(e) => setSalesForm({...salesForm, patientName: e.target.value})}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Cash/Credit</label>
            <select
              name="cashCredit"
              value={salesForm.cashCredit}
              onChange={(e) => setSalesForm({...salesForm, cashCredit: e.target.value})}
            >
              <option value="Cash">Cash</option>
              <option value="Credit">Credit</option>
            </select>
          </div>
          <div className="form-group">
            <label>Discount %</label>
            <input
              type="number"
              name="discountPercent"
              value={salesForm.discountPercent}
              onChange={(e) => setSalesForm({...salesForm, discountPercent: e.target.value})}
              step="0.01"
            />
          </div>
        </div>
      </div>

      <div className="sales-items">
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Batch No</th>
                <th>Exp Date</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Amount</th>
                <th>GST%</th>
                <th>Disc%</th>
                <th>GST Amt</th>
                <th>Cess?</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {salesForm.items.map((item, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      name="productName"
                      value={item.productName}
                      onChange={(e) => handleSalesChange(e, index)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="batchNo"
                      value={item.batchNo}
                      onChange={(e) => handleSalesChange(e, index)}
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      name="expiryDate"
                      value={item.expiryDate}
                      onChange={(e) => handleSalesChange(e, index)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name="quantity"
                      value={item.quantity}
                      onChange={(e) => handleSalesChange(e, index)}
                      min="1"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name="rate"
                      value={item.rate}
                      onChange={(e) => handleSalesChange(e, index)}
                      step="0.01"
                    />
                  </td>
                  <td>₹{item.amount.toFixed(2)}</td>
                  <td>
                    <input
                      type="number"
                      name="gstPercent"
                      value={item.gstPercent}
                      onChange={(e) => handleSalesChange(e, index)}
                      step="0.01"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name="discountPercent"
                      value={item.discountPercent}
                      onChange={(e) => handleSalesChange(e, index)}
                      step="0.01"
                    />
                  </td>
                  <td>₹{item.gstAmount.toFixed(2)}</td>
                  <td>
                    <input
                      type="checkbox"
                      name="cess"
                      checked={item.cess}
                      onChange={(e) => handleSalesChange(e, index)}
                    />
                  </td>
                  <td>
                    <button 
                      className="btn-remove"
                      onClick={() => removeItem(index)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button 
          type="button" 
          className="btn-add-item"
          onClick={addNewItem}
        >
          + Add Item
        </button>
      </div>

      <div className="sales-summary">
        <div className="summary-row">
          <span>Net Total:</span>
          <span>₹{salesForm.netTotal.toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span>Total GST:</span>
          <span>₹{salesForm.totalGst.toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span>Total Discount:</span>
          <span>₹{salesForm.totalDiscount.toFixed(2)}</span>
        </div>
        <div className="summary-row grand-total">
          <span>Grand Total:</span>
          <span>₹{salesForm.grandTotal.toFixed(2)}</span>
        </div>
      </div>

      <div className="sales-actions">
        <button className="btn-save">Save (F12)</button>
        <button className="btn-edit">Edit (F8)</button>
        <button className="btn-reprint">Reprint (F7)</button>
        <button className="btn-exit">Exit (F1)</button>
      </div>
    </div>
  );

  return (
    <div className="medicine-store-container">
      {currentUser && (
        <div className="user-header">
          <h2>{currentUser.pharmacyName}</h2>
          <p>Welcome, {currentUser.phone}</p>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      )}

      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Product Management
        </button>
        <button
          className={`tab-btn ${activeTab === 'sales' ? 'active' : ''}`}
          onClick={() => setActiveTab('sales')}
        >
          Sales Billing
        </button>
      </div>

      {activeTab === 'products' ? renderProductsTab() : renderSalesTab()}
    </div>
  );
};

export default MedicineStore;