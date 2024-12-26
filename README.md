# TaskHub Server

Welcome to the **TaskHub** server repository! This is the backend codebase for the TaskHub platform, which serves as an online group-study assignment platform. TaskHub allows registered users to create assignments, submit their work, review others' submissions, and manage grades seamlessly.

## Features

- **Authentication**: Secure JWT-based authentication system.
- **User Management**: Login, logout, and protected routes for authenticated users.
- **Assignments**:
  - Create new assignments.
  - View assignments by difficulty or search by title.
  - Update assignment details.
  - Delete assignments.
  - Fetch pending assignments (assignments that are not marked as completed).
- **Submissions**:
  - Submit assignments with required details like Google Docs link and notes.
  - Update submissions with feedback and marks.
  - View all submissions or filter submissions by assignment ID or user email.
- **Role-Based Access**: Ensure users can only access submissions related to their accounts.
- **Real-Time Status Management**: Mark assignments as "completed" or leave them "pending" with updates on the platform.

## Prerequisites

Before running this project, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or later)
- [MongoDB Atlas](https://www.mongodb.com/atlas/database) (for cloud database connection)
- A `.env` file containing the necessary environment variables (see below).

## Environment Variables

Create a `.env` file in the root directory and configure the following variables:

```env
PORT=5000
JWT_SECRET=your_jwt_secret_key
DB_USER=task-hub
DB_PASS=0bkFKZtiEjYibyzw
```

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/taskhub-server.git
   cd taskhub-server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the server:

   ```bash
   npm start
   ```

   The server will start on `http://localhost:5000` by default.

## API Endpoints

### Authentication

#### Generate JWT
- **Endpoint**: `/jwt`
- **Method**: `POST`
- **Description**: Generates a JWT token for authenticated users.
- **Request Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```

#### Logout
- **Endpoint**: `/logout`
- **Method**: `POST`
- **Description**: Clears the JWT token from cookies.

### Assignments

#### Create Assignment
- **Endpoint**: `/assignments`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "title": "Assignment Title",
    "marks": 100,
    "difficulty": "Easy",
    "dueDate": "2024-12-31"
  }
  ```

#### Get All Assignments
- **Endpoint**: `/assignments`
- **Method**: `GET`
- **Query Parameters**:
  - `difficulty`: Filter assignments by difficulty (e.g., `Easy` or `Hard`).
  - `search`: Search assignments by title.

#### Get Assignment by ID
- **Endpoint**: `/assignments/:id`
- **Method**: `GET`

#### Update Assignment
- **Endpoint**: `/assignments/:id`
- **Method**: `PUT`
- **Request Body**:
  ```json
  {
    "title": "Updated Title",
    "marks": 80,
    "difficulty": "Medium",
    "dueDate": "2025-01-15"
  }
  ```

#### Delete Assignment
- **Endpoint**: `/assignments/:id`
- **Method**: `DELETE`

### Submissions

#### Submit an Assignment
- **Endpoint**: `/submissions`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "assignmentId": "assignment_id",
    "userEmail": "user@example.com",
    "googleDocsLink": "http://link-to-doc",
    "quickNote": "Some notes",
    "marks": 100,
    "feedback": "Great job!"
  }
  ```

#### Get All Submissions
- **Endpoint**: `/submissions`
- **Method**: `GET`
- **Query Parameters**:
  - `email`: Filter submissions by user email.

#### Get Submissions by Assignment ID
- **Endpoint**: `/submissions/:assignmentId`
- **Method**: `GET`

#### Update Submission
- **Endpoint**: `/submissions/:id`
- **Method**: `PUT`
- **Request Body**:
  ```json
  {
    "feedback": "Needs improvement",
    "marks": 70
  }
  ```

### Pending Assignments

#### Get Pending Assignments
- **Endpoint**: `/pending-assignments`
- **Method**: `GET`

### Mark Update

#### Update Marks and Status
- **Endpoint**: `/mark-update/:id`
- **Method**: `PATCH`
- **Request Body**:
  ```json
  {
    "obtainedMarks": 85,
    "feedback": "Good work",
    "status": "completed"
  }
  ```

## Middleware

### Verify Token
- **Description**: Protects routes by verifying the JWT token from cookies.
- **Usage**: Applied to endpoints like `/submissions` to ensure only authenticated users have access.

## Tech Stack

- **Node.js**: Backend runtime environment.
- **Express.js**: Web framework for building REST APIs.
- **MongoDB Atlas**: NoSQL database for data storage.
- **JWT (JsonWebToken)**: Secure authentication mechanism.
- **dotenv**: Manage environment variables.
- **cookie-parser**: Parse cookies for authentication.

## Development Workflow

1. Fork and clone the repository.
2. Create a new branch for your feature/bugfix.
3. Write and test your code locally.
4. Commit and push your changes.
5. Open a pull request for review.

## License
 
This project is licensed under the MIT License. See the LICENSE file for more details.

---

Happy coding! If you encounter any issues or have suggestions, feel free to open an issue or pull request.
