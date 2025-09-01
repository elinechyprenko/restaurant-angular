# Restaurant

Tasty Nook is a **full-stack web application** for a modern restaurant.

## 🚀 Features

- **Authentication**: User registration and login  
- **Table booking**: Reserve tables through the system  
- **Event requests**: Submit a request for hosting events  
- **Food ordering**:  
  - On-site ordering  
  - Takeaway  
  - Delivery  
- **User dashboard**: Manage personal data, orders, and bookings  
- **Payment integration**: Secure payments via **Stripe**

## 🛠️ Technologies Used

### Frontend
- [Angular 17](https://angular.io/)  
- [Bootstrap 5](https://getbootstrap.com/)
- [RxJS 7.8](https://rxjs.dev/)

### Backend
- [Node.js](https://nodejs.org/)  
- [Express.js](https://expressjs.com/)  

### Database
- [MySQL](https://www.mysql.com/)

### Payments
- [Stripe](https://stripe.com/)

## Development server

- Install dependencies for frontend: `npm install`
- Install dependencies for backend: `cd server` => `npm install`
- Run the backend: `node server.js ` . This will start the Node.js/Express server (listening on `http://localhost:3000/` by default).
- Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.


## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests
Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help
To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
