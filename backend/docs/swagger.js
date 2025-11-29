import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'JeLisLaBIBLE API',
      version: '1.0.0',
      description: 'API pour l\'application JeLisLaBIBLE - Bible reading, audio, and chat features',
      contact: {
        name: 'JeLisLaBIBLE Team',
        email: 'contact@jelislabible.com'
      }
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:3001',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        BibleBook: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            testament: { type: 'string', enum: ['OT', 'NT'] },
            chapters: { type: 'integer' }
          }
        },
        Verse: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            number: { type: 'integer' },
            text: { type: 'string' },
            reference: { type: 'string' }
          }
        },
        ChatMessage: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            response: { type: 'string' },
            type: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js', './controllers/*.js']
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };