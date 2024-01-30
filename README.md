# PhotoHub

A REST API server for managing photos, collections, and memories.

## Table of Contents

- [Introduction](#introduction)
- [Models](#models)
- [Routes](#routes)
- [Installation](#installation)
- [Usage](#usage)
- [Technology](#technology)
- [Author](#author)
- [License](#license)

## Introduction

PhotoHub is a server-side application built with Node.js, Express, and MongoDB, providing a RESTful API for managing user accounts, photos, sets, likes, and a dashboard feature.

## Models

1. **User Model**: Represents user accounts with information like full name, username, password, and avatar.

2. **Photo Model**: Stores information about photos, including title, description, owner, URL, and whether it is public or not.

3. **Set Model**: Represents collections or sets of photos owned by users.

4. **Like Model**: Records user likes on photos.

## Routes

The application exposes the following routes:

- **User Routes**: Handles user account management.
- **Photo Routes**: Manages CRUD operations for photos.
- **Set Routes**: Manages sets or collections of photos.
- **Like Routes**: Handles user likes on photos.
- **Dashboard Routes**: Provides endpoints for fetching user dashboard information.
- **Health Check Routes**: A simple route for health checking.

## Installation

Clone the repository and install dependencies

```bash
  git clone https://github.com/code-devendra/PhotoHub.git

  cd PhotoHub

  npm install
```

## Usage

Create .env file and write environment variables

```bash
PORT = 8000
MONGODB_URI = your_mongodb_connection_string
CORS_ORIGIN = *

ACCESS_TOKEN_SECRET = your_jwt_access_token_secret_key
ACCESS_TOKEN_EXPIRY = 1d
REFRESH_TOKEN_SECRET = your_jwt_refresh_token_secret_key
REFRESH_TOKEN_EXPIRY = 10d

CLOUDINARY_CLOUD_NAME = your_cloudinary_cloud_name
CLOUDINARY_API_KEY = your_cloudinary_api_key
CLOUDINARY_API_SECRET = your_cloudinary_api_secret
```

start the server

```bash
npm start
```

## Technology

- Node
- Express
- MongoDB
- Mongoose
- jsonwebtoken
- bcrypt
- multer
- cloudinary

## Authors

- [@codedevendra](https://www.github.com/code-devendra) (Devendra Khinchi)

## License

[MIT](https://choosealicense.com/licenses/mit/)
