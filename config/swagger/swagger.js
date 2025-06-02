const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Backend API Documentation',
      version: '1.0.0',
      description: 'API documentation for the Backend application',
      contact: {
        name: 'API Support',
        url: 'https://example.com',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: `http://3.110.136.41:5000`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'Authorization',
          description: 'Enter your JWT token directly (without any prefix)'
        },
      },
    },
  },
  apis: ['./routes/*.js', './models/*.js', './server.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

const swaggerDocs = (app) => {
  const swaggerUiOptions = {
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true,
    }
  };
  
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));
  
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
  
  console.log(`Swagger docs available at /api-docs`);
};

module.exports = swaggerDocs; 