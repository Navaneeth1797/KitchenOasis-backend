# Kitchen Oasis Backend API


Welcome to the Kitchen Oasis Backend API documentation. This API powers the backend functionality for the Kitchen Oasis web application, providing endpoints for managing products, user authentication, orders, payments, and more.




# Technologies Used
- Node.js: Backend JavaScript runtime environment.
- Express.js: Web application framework for Node.js.
- MongoDB: NoSQL database for storing user, product, and order data.
- Mongoose: MongoDB object modeling tool.
- JWT: JSON Web Tokens for user authentication and authorization.
- Stripe API: Payment processing API for handling transactions.
- Cloudinary: Cloud-based image and video management service for uploading and storing product images.
- Bcrypt: Password hashing library for securing user passwords.
- Dotenv: Environment variable management for configuring application settings.

  


# User Roles and Functionalities


## Normal User:

- Can register an account: Register
- Can login to their account: Login
- Can view products: Products
- Can place orders
- Can view their order history
- Can update their profile information
- Can reset their password if forgotten
- Can review products they have purchased

  
## Admin:

- Can register an admin account: Admin Register
- Can login to their admin account: Admin Login
- Can view products: Products
- Can add new products
- Can update existing product information
- Can delete products
- Can view all user accounts
- Can update user account information
- Can delete user accounts
- Can view all orders
- Can update order statuses
- Can delete orders

  
## Important: For POST or PUT requests related to authentication (register, login, forgot password, reset password), please use the following endpoints without the "/api/" with the provided link (https://kitchenoasis-backend.onrender.com/api/products):


- Register: Register
- Login: Login
- Forgot Password: Forgot Password
- Reset Password: Reset Password


# Endpoints Overview


## Products:


- /api/products: GET (Get all products), POST (Create a new product)
- /api/products/:id: GET (Get product by ID), PUT (Update product by ID), DELETE (Delete product by ID)

  
## Users:

- /api/register: POST (Register a new user)
- /api/login: POST (Login user)
- /api/logout: GET (Logout user)
- /api/password/forgot: POST (Forgot password)
- /api/password/reset/:token: PUT (Reset password)
- /api/profile: GET (Get user profile), PUT (Update user profile)
- /api/password/update: PUT (Update user password)

  
## Admin:


- /api/admin/register: POST (Register a new admin user)
- /api/admin/login: POST (Login admin user)
- /api/admin/users: GET (Get all users)
- /api/admin/user/:id: GET (Get user by ID), PUT (Update user by ID), DELETE (Delete user by ID)
- /api/admin/products: GET (Get all products), POST (Create a new product)
- /api/admin/products/:id: PUT (Update product by ID), DELETE (Delete product by ID)
- /api/admin/orders: GET (Get all orders)
- /api/admin/order/:id: PUT (Update order by ID), DELETE (Delete order by ID)
- /api/admin/get_sales: GET (Get sales data)

  
## Orders:

- /api/orders/new: POST (Create a new order)
- /api/order/:id: GET (Get order by ID)
- /api/me/orders: GET (Get current user's orders)

  
## Payment:

- /api/payment/checkout_session: POST (Create a Stripe checkout session)
- /api/payment/webhook: POST (Stripe webhook endpoint)
  

  # Additional Information

  
For more detailed information on request payloads, responses, and error handling, please refer to the source code and JSDoc comments provided in the respective controller files.
