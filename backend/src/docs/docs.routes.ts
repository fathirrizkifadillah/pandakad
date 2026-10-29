import { type Request, type Response, Router } from "express";
import { openapiSpec } from "./openapi.js";

export const docsRouter = Router();

// Endpoint Spesifikasi JSON OpenAPI 3.1.0
docsRouter.get("/openapi.json", (_req: Request, res: Response) => {
	res.status(200).json(openapiSpec);
});

// Template HTML Swagger UI Interaktif Tema Panda
const swaggerHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PANDAKAD API Documentation - Universitas Panda Raya</title>
  <link rel="icon" type="image/png" href="/assets/logo_unpanda.png" />
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .custom-header {
      background: linear-gradient(135deg, #566432 0%, #75834a 100%);
      color: white;
      padding: 16px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 2px 8px rgba(0,0,0,0.12);
    }
    .brand-title {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.5px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .badge-portal {
      background: rgba(255,255,255,0.2);
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .topbar { display: none !important; }
    .swagger-ui .info { margin: 24px 0 !important; }
    .swagger-ui .info .title { color: #1e293b; font-weight: 800; }
    .swagger-ui .scheme-container { background: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .swagger-ui .btn.authorize { color: #566432; border-color: #566432; }
    .swagger-ui .btn.authorize svg { fill: #566432; }
  </style>
</head>
<body>
  <div class="custom-header">
    <div class="brand-title">
      <span>🐼 PANDAKAD REST API</span>
      <span class="badge-portal">OpenAPI 3.1 Portal</span>
    </div>
    <div style="font-size: 12px; font-weight: 600; opacity: 0.9;">
      Universitas Panda Raya • FTI
    </div>
  </div>

  <div id="swagger-ui"></div>

  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    window.onload = function() {
      SwaggerUIBundle({
        url: "/api/v1/openapi.json",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout",
        defaultModelsExpandDepth: 1,
        docExpansion: "list"
      });
    };
  </script>
</body>
</html>`;

// Render UI Dokumentasi Interaktif
docsRouter.get("/docs", (_req: Request, res: Response) => {
	res.setHeader("Content-Type", "text/html; charset=utf-8");
	res.status(200).send(swaggerHtml);
});
