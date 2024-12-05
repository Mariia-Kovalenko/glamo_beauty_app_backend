## Project Overview

This is the backend API for Glamo, a platform that enables location-based search for beauty professionals based on the services they provide. It supports user management, authentication, geolocation, and integration with Google Maps for visualizing beauty professionals on a map.

## Features
- User Authentication: Secure login and registration using JWT tokens.
- Role-based Access Control: Different roles for customers and beauty professionals with restricted access to certain endpoints.
- Geolocation Services: Find beauty professionals within a specified radius of a given location.
- Profile Management: Allows beauty professionals to register, update their services, and set their location.
- Error Handling: Standardized error responses for common HTTP status codes.


## Setup
1. Clone the repository.
2. Install dependencies:
```npm install```
3. Create a .env file in the root directory with the following variables:
```bash
DATABASE_CONNECTION=your-mongodb-uri
ACCESS_TOKEN_SECRET=your-secret-key
GOOGLE_APPLICATION_CREDENTIALS=your-google-credentials
```

Run the development server:
```bash
npm run start:dev
```
## API Documentation
This project includes Swagger documentation. To access it:

1. Start the server.
2. Open your browser and navigate to: http://localhost:8080/api (replace with your actual host and port).
The Swagger UI will display all available endpoints, their required parameters, and example responses.
