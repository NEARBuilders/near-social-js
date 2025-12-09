import 'dotenv/config';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createRsbuild, logger } from '@rsbuild/core';
import { OpenAPIHandler } from '@orpc/openapi/fetch';
import { OpenAPIReferencePlugin } from '@orpc/openapi/plugins';
import { onError } from '@orpc/server';
import { RPCHandler } from '@orpc/server/fetch';
import { BatchHandlerPlugin } from '@orpc/server/plugins';
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4';
import config from './rsbuild.config';
import { initializePlugins } from './src/runtime';
import { createRouter } from './src/routers';

async function createContext(req: Request) {
  return {};
}

async function startServer() {
  const port = Number(process.env.PORT) || 3001;
  const apiPort = Number(process.env.API_PORT) || 3000;
  const isDev = process.env.NODE_ENV !== 'production';

  const plugins = await initializePlugins();
  const router = createRouter(plugins);

  const rpcHandler = new RPCHandler(router, {
    plugins: [new BatchHandlerPlugin()],
    interceptors: [
      onError((error) => {
        console.error('RPC Error:', error);
      }),
    ],
  });

  const apiHandler = new OpenAPIHandler(router, {
    plugins: [
      new OpenAPIReferencePlugin({
        schemaConverters: [new ZodToJsonSchemaConverter()],
        specGenerateOptions: {
          info: {
            title: 'Host API',
            version: '1.0.0',
          },
          servers: [{ url: `http://localhost:${apiPort}/api` }],
        },
      }),
    ],
    interceptors: [
      onError((error) => {
        console.error('OpenAPI Error:', error);
      }),
    ],
  });

  const apiApp = new Hono();

  apiApp.use(
    '/*',
    cors({
      origin: process.env.CORS_ORIGIN?.split(',').map((o) => o.trim()) ?? [
        'http://localhost:3001',
      ],
      credentials: true,
    })
  );

  apiApp.get('/health', (c) => c.text('OK'));

  const serverUrl = process.env.SERVER_URL || 'http://localhost:3000';

  apiApp.all('/api/auth/*', async (c) => {
    const url = new URL(c.req.url);
    const targetUrl = `${serverUrl}${url.pathname}${url.search}`;

    const headers = new Headers(c.req.raw.headers);
    headers.delete('host');

    const response = await fetch(targetUrl, {
      method: c.req.method,
      headers,
      body:
        c.req.method !== 'GET' && c.req.method !== 'HEAD'
          ? c.req.raw.body
          : undefined,
      redirect: 'manual',
      // @ts-expect-error duplex is required for streaming body
      duplex: 'half',
    });

    const responseHeaders = new Headers(response.headers);

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  });

  apiApp.all('/api/rpc/*', async (c) => {
    const req = c.req.raw;
    const context = await createContext(req);

    const result = await rpcHandler.handle(req, {
      prefix: '/api/rpc',
      context,
    });

    return result.response
      ? c.newResponse(result.response.body, result.response)
      : c.text('Not Found', 404);
  });

  apiApp.all('/api/*', async (c) => {
    const req = c.req.raw;
    const context = await createContext(req);

    const result = await apiHandler.handle(req, {
      prefix: '/api',
      context,
    });

    return result.response
      ? c.newResponse(result.response.body, result.response)
      : c.text('Not Found', 404);
  });

  if (isDev) {
    serve({ fetch: apiApp.fetch, port: apiPort }, (info) => {
      logger.info(`API server running at http://localhost:${info.port}`);
      logger.info(
        `  http://localhost:${info.port}/api     → REST API (OpenAPI docs)`
      );
      logger.info(`  http://localhost:${info.port}/api/rpc → RPC endpoint`);
    });

    const rsbuild = await createRsbuild({
      cwd: import.meta.dirname,
      rsbuildConfig: config,
    });

    await rsbuild.startDevServer();
  } else {
    apiApp.use('/*', serveStatic({ root: './dist' }));
    apiApp.get('*', serveStatic({ root: './dist', path: 'index.html' }));

    serve({ fetch: apiApp.fetch, port }, (info) => {
      logger.info(
        `Host production server running at http://localhost:${info.port}`
      );
      logger.info(
        `  http://localhost:${info.port}/api     → REST API (OpenAPI docs)`
      );
      logger.info(`  http://localhost:${info.port}/api/rpc → RPC endpoint`);
    });
  }
}

startServer().catch((err) => {
  logger.error('Failed to start server');
  logger.error(err);
  process.exit(1);
});
