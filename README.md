# PhotoHub

A REST API server for managing photos, collections, and memories.

## Table of Contents

- [Introduction](#introduction)
- [Models](#models)
- [Routes](#routes)
- [Installation](#installation)
- [Usage](#usage)
- [Technology](#technology)
- [API Reference](#api-reference)
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

## API-Reference

### User

#### Register user

```http
  POST /api/v1/users/register
```

###### body (form-data)

| Parameter  | Type     | Description                        |
| :--------- | :------- | :--------------------------------- |
| `fullName` | `string` | **Required**. Name of the user     |
| `email`    | `string` | **Required**. email id of the user |
| `username` | `string` | **Required**. username of the user |
| `password` | `string` | **Required**. user password        |
| `avatar`   | `file`   | **Required**. photo of the user    |

#### Login user

```http
  POST /api/v1/users/login
```

###### body

| Parameter           | Type     | Description                                   |
| :------------------ | :------- | :-------------------------------------------- |
| `email or username` | `string` | **Required**. email id / username of the user |
| `password`          | `string` | **Required**. profile password                |

#### Refresh Token

```http
  POST /api/v1/users/refresh-token
```

#### Logout

```http
  POST /api/v1/users/logout
```

#### Change Password

```http
  PATCH /api/v1/users/change-password
```

###### body

| Parameter     | Type     | Description                        |
| :------------ | :------- | :--------------------------------- |
| `oldPassword` | `string` | **Required**. profile old password |
| `newPassword` | `string` | **Required**. profile new password |

#### who am i

```http
  GET /api/v1/users/whoami
```

#### Update Account Details

```http
  PATCH /api/v1/users/update-account
```

###### body

| Parameter  | Type     | Description                        |
| :--------- | :------- | :--------------------------------- |
| `fullName` | `string` | **Required**. Name of the user     |
| `email`    | `string` | **Required**. email id of the user |

#### Update Avatar

```http
  PATCH /api/v1/users/avatar
```

###### body (form-data)

| Parameter | Type   | Description                     |
| :-------- | :----- | :------------------------------ |
| `avatar`  | `file` | **Required**. photo of the user |

#### Get user profile

```http
  GET /api/v1/users/p/:username
```

###### params

| Parameter  | Type     | Description                    |
| :--------- | :------- | :----------------------------- |
| `username` | `string` | **Required**. profile username |

### Photo

#### Create photo

```http
  POST /api/v1/photos
```

###### body (form-data)

| Parameter     | Type      | Description                     |
| :------------ | :-------- | :------------------------------ |
| `title`       | `string`  | **Required**. photo title       |
| `description` | `string`  | **Optional**. photo description |
| `isPublic`    | `boolean` | **Optional**. by default true   |
| `photo`       | `file`    | **Required**. photo file        |

#### Get all photos with search and pagination

```http
  GET /api/v1/photos
```

###### query

| Parameter  | Type     | Description                                  |
| :--------- | :------- | :------------------------------------------- |
| `query`    | `string` | **Optional**. search query                   |
| `page`     | `number` | **Optional**. page no.                       |
| `limit`    | `number` | **Optional**. response limit                 |
| `sortBy`   | `string` | **Optional**. either creadtedAt or likeCount |
| `sortType` | `number` | **Optional**. either 1 or -1                 |

#### Get one photo

```http
  GET /api/v1/photos/:photoId
```

###### params

| Parameter | Type     | Description           |
| :-------- | :------- | :-------------------- |
| `photoId` | `string` | **Required**. photoId |

#### Delete photo

```http
  DELETE /api/v1/photos/:photoId
```

###### params

| Parameter | Type     | Description           |
| :-------- | :------- | :-------------------- |
| `photoId` | `string` | **Required**. photoId |

#### Update photo details

```http
  PATCH /api/v1/photos/:photoId
```

###### params

| Parameter | Type     | Description           |
| :-------- | :------- | :-------------------- |
| `photoId` | `string` | **Required**. photoId |

###### body (form-data)

| Parameter     | Type     | Description                     |
| :------------ | :------- | :------------------------------ |
| `title`       | `string` | **Required**. photo title       |
| `description` | `string` | **Optional**. photo description |
| `photo`       | `file`   | **Optional**. photo file        |

#### Toggle public mode

```http
  PATCH /api/v1/photos/toggle/public/:photoId
```

###### params

| Parameter | Type     | Description           |
| :-------- | :------- | :-------------------- |
| `photoId` | `string` | **Required**. photoId |

### Set

#### Create set

```http
  POST /api/v1/sets
```

###### body

| Parameter     | Type     | Description                   |
| :------------ | :------- | :---------------------------- |
| `title`       | `string` | **Required**. set title       |
| `description` | `string` | **Required**. set description |

#### Get set info

```http
  GET /api/v1/sets/:setId
```

###### params

| Parameter | Type     | Description         |
| :-------- | :------- | :------------------ |
| `setId`   | `string` | **Required**. setId |

#### Update set

```http
  PATCH /api/v1/sets/:setId
```

###### params

| Parameter | Type     | Description         |
| :-------- | :------- | :------------------ |
| `setId`   | `string` | **Required**. setId |

###### body

| Parameter     | Type     | Description                   |
| :------------ | :------- | :---------------------------- |
| `title`       | `string` | **Required**. set title       |
| `description` | `string` | **Required**. set description |

#### Delete set

```http
  DELETE /api/v1/sets/:setId
```

###### params

| Parameter | Type     | Description         |
| :-------- | :------- | :------------------ |
| `setId`   | `string` | **Required**. setId |

#### Add photo to a Set

```http
  PATCH /api/v1/sets/add/:photoId/:setId
```

###### params

| Parameter | Type     | Description           |
| :-------- | :------- | :-------------------- |
| `photoId` | `string` | **Required**. photoId |
| `setId`   | `string` | **Required**. setId   |

#### Remove photo to a Set

```http
  PATCH /api/v1/sets/add/:photoId/:setId
```

###### params

| Parameter | Type     | Description           |
| :-------- | :------- | :-------------------- |
| `photoId` | `string` | **Required**. photoId |
| `setId`   | `string` | **Required**. setId   |

#### Get user sets

```http
  GET /api/v1/sets/user/:userId
```

###### params

| Parameter | Type     | Description          |
| :-------- | :------- | :------------------- |
| `userId`  | `string` | **Required**. userId |

### Like

#### Toggle Like

```http
  POST /api/v1/likes/toggle/p/:photoId
```

###### params

| Parameter | Type     | Description           |
| :-------- | :------- | :-------------------- |
| `photoId` | `string` | **Required**. photoId |

#### Get all liked photos

```http
  GET /api/v1/likes/photos
```

### Dashboard

#### Get Profile stats

```http
  GET /api/v1/dashboard/stats
```

#### Get all photos uploaded by user

```http
  GET /api/v1/dashboard/photos
```

### Healthcheck

#### check health

```http
  GET /api/v1/healthcheck
```

## Author

- [@codedevendra](https://www.github.com/code-devendra) (Devendra Khinchi)

## License

[MIT](https://choosealicense.com/licenses/mit/)
