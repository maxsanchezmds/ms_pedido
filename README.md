# ms_pedido

Microservicio Nest.js/Express para gestionar pedidos.

## Endpoints

- `GET /` health check.
- `POST /api/pedidos` crea un pedido.
- `PATCH /api/pedidos/:id_pedido` edita productos, cantidades o direccion de despacho.
- `PATCH /api/pedidos/:id_pedido/cancelar` marca el pedido como cancelado.
- `GET /api/pedidos/:id_pedido/estado` obtiene el estado del pedido.

## Variables de entorno

- `PORT`: puerto HTTP. Default `3000`.
- `DATABASE_URL`: URL PostgreSQL completa.
- `DATABASE_SCHEMA`: schema PostgreSQL a usar. Default `public`. Los previews usan `pr_<numero>`.

Tambien se soportan `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USER` y `DATABASE_PASSWORD`.

## CI/CD

- PR: crea un preview aislado con `srv-pedidos-pr-<numero>`, un Kong preview y un namespace Cloud Map `smartlogix-pr-<numero>.local`.
- Cierre de PR: elimina los recursos efimeros y ejecuta limpieza del schema `pr_<numero>`.
- `main`: despliega con canary controlado por Kong usando `pedidos` y `pedidos-canary`.
