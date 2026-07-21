# User Flows

## 1. Guest Purchase Flow (Primary MVP)

Home Page
→ Browse Products
→ Search / Filter Products
→ View Product Details
→ Add to Cart
→ View Cart
→ Proceed to Checkout
→ Enter Customer Information (Name, Phone Number, and Email)
→ Select Delivery Location
→ Choose Payment Method (Bank Transfer via Dynamic Account Number Generated from Flutterwave)
→ Complete Payment (Bank Transfer to Dynamic Account Number)
→ Payment Successful
→ Order Confirmation
→ Order Tracking
→ Delivery Completed
→ Leave Review (Optional)

OR

Home Page
→ Browse Products
→ Search / Filter Products
→ View Product Details
→ Buy Now
→ Proceed to Checkout
→ Enter Customer Information (Name, Phone Number, and Email)
→ Select Delivery Location
→ Choose Payment Method (Bank Transfer via Dynamic Account Number Generated from Flutterwave)
→ Complete Payment (Bank Transfer to Dynamic Account Number)
→ Payment Successful
→ Order Confirmation
→ Order Tracking
→ Delivery Completed
→ Leave Review (Optional)

---

## 2. Customer Registration Flow

Home Page
→ Sign Up
→ Enter Name
→ Enter Email or Phone
→ Create Password
→ Verify Account (Optional for MVP)
→ Login
→ Customer Dashboard

---

## 3. Customer Login Flow

Home Page
→ Login
→ Enter Email/Phone
→ Enter Password
→ Dashboard

---

## 4. Returning Customer Purchase Flow

Login
→ Browse Products
→ Product Details
→ Add to Cart
→ Checkout
→ Select Delivery Location
→ Payment (Bank Transfer via Dynamic Account Number Generated from Flutterwave)
→ Order Confirmation
→ Track Order

OR

Login
→ Browse Products
→ Product Details
→ Buy Now
→ Checkout
→ Select Delivery Location
→ Payment (Bank Transfer via Dynamic Account Number Generated from Flutterwave)
→ Order Confirmation
→ Track Order

---

## 5. Order Tracking Flow

Home
→ Track Order
→ Enter Order Number (Guest)

OR

Login
→ My Orders
→ Select Order
→ View Current Status

Possible Order Status:

* Pending
* Payment Confirmed
* Processing
* Ready for Delivery
* Out for Delivery
* Delivered
* Cancelled

---

## 6. Product Review Flow

Delivered Order
→ My Orders
→ Select Product
→ Give Rating
→ Write Review
→ Submit

---

## 7. Admin Authentication Flow

Admin Login
→ Dashboard

---

## 8. Product Management Flow

Dashboard
→ Products
→ Add Product
→ Upload Images
→ Enter Product Information
→ Set Price
→ Set Stock
→ Publish Product

Edit Product

Dashboard
→ Products
→ Select Product
→ Edit
→ Save

Delete Product

Dashboard
→ Products
→ Select Product
→ Delete
→ Confirm

---

## 9. Category Management Flow

Dashboard
→ Categories
→ Add Category
→ Edit Category
→ Delete Category

---

## 10. Order Management Flow

Dashboard
→ Orders
→ View Order
→ Verify Bank Transfer Payment via Flutterwave Dynamic Account Number
→ Accept Order
→ Update Status
→ Mark as Delivered

---

## 11. Delivery Address Management Flow

Dashboard
→ Delivery Locations
→ Add Location
→ Set Delivery Fee
→ Enable/Disable Location
→ Save

Customers can only choose from locations created by the admin.

---

## 12. Customer Management Flow

Dashboard
→ Customers
→ View Customer
→ View Orders
→ Disable/Enable Account (if necessary)

---

## 13. Store Configuration Flow

Dashboard
→ Store Settings
→ Update Shop Address
→ Update Customer Service Phone Number
→ Save

---

## 14. Trust Flow (Core Experience)

Visitor
→ Browse Store
→ See Genuine Product Photos
→ Read Honest Description
→ See Clear Pricing
→ View Delivery Information
→ Secure Checkout
→ Payment Confirmation
→ Order Updates
→ Successful Delivery
→ Positive Review
→ Repeat Purchase

---

# MVP User Roles

### Guest

* Browse products
* Add to cart
* Buy now from product details page
* Checkout with name, phone number, and email required
* Pay via bank transfer using a dynamic account number generated from Flutterwave
* Track order using order number

### Customer

* Everything a Guest can do
* View order history
* Save profile
* Submit reviews

### Admin

* Manage products
* Manage categories
* Manage delivery locations
* Manage customers
* Manage orders
* View analytics
* Configure store settings, including customer service phone number and shop address

