# backend/README.md

# Home Help Backend

## Overview

The backend of Home Help Connection is a robust Node.js and Express application that powers the platform's core functionalities. It provides RESTful APIs for user authentication, user management, and service-related operations.

## Key Features

- **User Authentication**: Secure login and registration for users.
- **Admin Management**: APIs for managing users and monitoring platform activity.
- **Service Operations**: APIs for creating, updating, and managing service requests.

## Societal Contribution

The backend plays a crucial role in solving societal challenges by:
- Ensuring secure and reliable data handling for users and service providers.
- Facilitating seamless communication between users and service providers.
- Supporting the platform's mission to improve access to home assistance services.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the backend directory:
   ```
   cd backend
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Set up the `.env` file with the required environment variables.

## Usage

To start the backend server, run:
```
npm start
```

The server will start on the specified port (default is 3000).

## API Endpoints

Refer to the [API Endpoints](#api-endpoints) section for detailed information on the available APIs.

- **Admin User Management**
  - `GET /api/admin/users` - Get all users
  - `GET /api/admin/users/:id` - Get user by ID
  - `POST /api/admin/users` - Create a new user
  - `PUT /api/admin/users/:id` - Update user by ID
  - `DELETE /api/admin/users/:id` - Delete user by ID

- **Authentication**
  - `POST /api/auth/login` - Log in a user
  - `POST /api/auth/register` - Register a new user

- **User Management**
  - `GET /api/users/:id` - Get user details
  - `PUT /api/users/:id` - Update user information
  - `DELETE /api/users/:id` - Delete a user

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.