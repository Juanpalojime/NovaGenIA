const fastify = require('fastify')({ logger: true });
const path = require('path');
const axios = require('axios');
const fs = require('fs');
const WebSocket = require('ws');

// Register plugins
fastify.register(require('@fastify/cors'), {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
});

fastify.register(require('@fastify/static'), {
    root: path.join(__dirname, '../outputs'),
    prefix: '/outputs/',
});

fastify.register(require('@fastify/websocket'));

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://127.0.0.1:7860';
const PYTHON_WS_URL = process.env.PYTHON_WS_URL || 'ws://127.0.0.1:7860';

// Health Check
fastify.get('/health', async (request, reply) => {
    try {
        const response = await axios.get(`${PYTHON_API_URL}/health`);
        return {
            status: 'online',
            node_status: 'ok',
            python_status: response.data,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        return {
            status: 'degraded',
            node_status: 'ok',
            python_status: 'offline',
            error: error.message
        };
    }
});

// Proxy Image Generation
fastify.post('/generate', async (request, reply) => {
    try {
        const response = await axios.post(`${PYTHON_API_URL}/generate`, request.body);
        return response.data;
    } catch (error) {
        reply.status(error.response?.status || 500).send(error.response?.data || error.message);
    }
});

// Proxy Img2Img
fastify.post('/img2img', async (request, reply) => {
    try {
        const response = await axios.post(`${PYTHON_API_URL}/img2img`, request.body);
        return response.data;
    } catch (error) {
        reply.status(error.response?.status || 500).send(error.response?.data || error.message);
    }
});

// Proxy ControlNet
fastify.post('/controlnet', async (request, reply) => {
    try {
        const response = await axios.post(`${PYTHON_API_URL}/controlnet`, request.body);
        return response.data;
    } catch (error) {
        reply.status(error.response?.status || 500).send(error.response?.data || error.message);
    }
});

// Proxy Stats
fastify.get('/stats', async (request, reply) => {
    try {
        const response = await axios.get(`${PYTHON_API_URL}/stats`);
        return response.data;
    } catch (error) {
        return {
            avg_gen_time: "0s",
            total_generations: 0,
            today_generations: 0,
            error: 'Python backend unreachable'
        };
    }
});

// Proxy GPU Status
fastify.get('/gpu/status', async (request, reply) => {
    try {
        const response = await axios.get(`${PYTHON_API_URL}/gpu/status`);
        return response.data;
    } catch (error) {
        return { status: 'offline', error: 'Python backend unreachable' };
    }
});

// WebSocket Proxy for Progress
fastify.get('/ws/progress/:jobId', { websocket: true }, (connection, req) => {
    const { jobId } = req.params;
    console.log(`🔌 WebSocket proxy connecting for task: ${jobId}`);

    const pythonWs = new WebSocket(`${PYTHON_WS_URL}/ws/progress/${jobId}`);

    pythonWs.on('open', () => {
        console.log(`✅ Connected to Python WebSocket for ${jobId}`);
    });

    pythonWs.on('message', (data) => {
        connection.socket.send(data.toString());
    });

    pythonWs.on('close', () => {
        console.log(`❌ Python WebSocket closed for ${jobId}`);
        connection.socket.close();
    });

    pythonWs.on('error', (err) => {
        console.error(`⚠️ Python WS Error for ${jobId}:`, err);
    });

    connection.socket.on('message', (message) => {
        if (pythonWs.readyState === WebSocket.OPEN) {
            pythonWs.send(message.toString());
        }
    });

    connection.socket.on('close', () => {
        pythonWs.close();
    });
});

// List outputs
fastify.get('/outputs', async (request, reply) => {
    const outputsDir = path.join(__dirname, '../outputs');
    if (!fs.existsSync(outputsDir)) {
        return [];
    }
    const files = fs.readdirSync(outputsDir);
    return files
        .filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f))
        .map(f => ({
            name: f,
            url: `/outputs/${f}`,
            mtime: fs.statSync(path.join(outputsDir, f)).mtime
        }))
        .sort((a, b) => b.mtime - a.mtime);
});

// Start the server
const start = async () => {
    try {
        await fastify.listen({ port: 3000, host: '0.0.0.0' });
        console.log(`🚀 Node.js (Fastify) Gateway running at http://localhost:3000`);
        console.log(`🔗 Proxying AI tasks to Python at ${PYTHON_API_URL}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
