import express from "express";
import cors from "cors"; 
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import projectRouter from './routes/projects.js';

const app = express();
const PORT = 3000;
 

// JSON body parser middleware
app.use(express.json());
app.use(cors());

// Swagger options
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'IS24 projects manager API',
      version: '1.0.0',
      description: 'An API for managing projects.',
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
      },
    ],
  },
  apis: ['./server/routes/projects.ts'],
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Serve swagger documentation
app.use('/api/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Use project router for all endpoints starting with "/api/projects"
app.use('/api/projects', projectRouter); 

// Start the server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

