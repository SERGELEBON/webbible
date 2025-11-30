import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

// Build a robust URL for servers[0]
// Prefer API_BASE_URL if set (can already include /api). Otherwise build from HOST or localhost and append /api.
const rawBase = process.env.API_BASE_URL || process.env.HOST || `http://localhost:${process.env.PORT || 3001}`;
const normalizedBase = rawBase.replace(/\/$/, '');
const serverUrl = normalizedBase.endsWith('/api') ? normalizedBase : `${normalizedBase}/api`;

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'JeLisLaBIBLE API',
            version: '1.0.0',
            description:
                "API pour l'application JeLisLaBIBLE — lecture de la Bible, audio, chat et fonctionnalités associées.",
            contact: {
                name: 'JeLisLaBIBLE Team',
                email: 'contact@jelislabible.com'
            }
        },
        servers: [
            {
                url: serverUrl,
                description: 'Development / Production server (based on env)'
            }
        ],
        tags: [
            { name: 'Auth', description: 'Authentication routes (login, register, refresh tokens)' },
            { name: 'Bible', description: 'Bible content: books, chapters, verses, audio' },
            { name: 'Chat', description: 'Chat and AI-related endpoints' },
            { name: 'Health', description: 'Health & status endpoints' }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Utiliser "Bearer <token>"'
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
            },
            responses: {
                UnauthorizedError: {
                    description: 'Authentication information is missing or invalid',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                },
                ValidationError: {
                    description: 'Validation failed',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                }
            }
        }
        // Note: we intentionally do not set a global 'security' requirement here,
        // so endpoints can opt-in with @swagger security annotations as needed.
    },
    // Patterns to scan for JSDoc Swagger blocks.
    // Keep these patterns conservative but inclusive of nested route files and this docs file.
    apis: [
        './routes/**/*.js',        // all routes (recursively)
        './controllers/**/*.js',   // controllers if annotated there
        './docs/*.js'              // include this file so inline docs (e.g. /health) are discovered
    ],
    // Optional swagger-jsdoc settings could be added here
};

// Generate specs
const specs = swaggerJsdoc(options);

// Export as before so your server.js can import unchanged
export { specs, swaggerUi };
