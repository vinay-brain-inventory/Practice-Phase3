# Day 2 — ProductsApp (TS + Express + Mongoose)

## Setup
- MongoDB should be running locally
- Default DB: `mongodb://127.0.0.1:27017/day2_products_app`
- Default port: `3002`

## Run
```bash
npm install
npm run seed
npm run build
node dist/index.js
```

## API
### Health
- `GET /health`

### Products Search (Paginated)
- `GET /products`

Query params:
- `search`: text search on `name` + `description`
- `category`: `electronics | fashion | grocery | books | home`
- `minPrice`, `maxPrice`
- `page` (default 1)
- `limit` (default 20, max 100)
- `sortBy`: `newest | priceAsc | priceDesc | nameAsc`
- `explain=true`: returns a simplified index/perf summary

Example:
```bash
GET http://localhost:3002/products?search=product&category=electronics&minPrice=100&page=1&limit=20&sortBy=newest
```

