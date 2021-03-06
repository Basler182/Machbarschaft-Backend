import Router from 'express';
import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';
import definition from '../config/swagger-config';

const router = Router();

const options = {
  definition,
  apis: [
    path.resolve(__dirname, 'auth-route.js'),
    path.resolve(__dirname, 'phone-route.js'),
    path.resolve(__dirname, 'request-route.js'),
    path.resolve(__dirname, 'process-route.js'),
    path.resolve(__dirname, 'feedback-route.js'),
    path.resolve(__dirname, 'address-route.js'),
    path.resolve(__dirname, 'user-route.js'),
    path.resolve(__dirname, 'dashboard-route.js'),
    path.resolve(__dirname, 'contact-route.js'),
  ],
};

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../docs.html'));
});

router.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerJSDoc(options));
});

export default router;
