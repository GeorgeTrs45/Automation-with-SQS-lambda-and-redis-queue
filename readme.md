## Test the flow
Run Redis (docker run -p 6379:6379 redis)
Start Express server:
```bash
node src/server.js
```
Start the worker:
```bash
node worker.js
```
Send a post request
```bash
curl -X POST http://localhost:3000/api/products/enqueue \
-H "Content-Type: application/json" \
-d '{"url":"https://asda.com/product/123","quantity":3,"name":"Ketchup"}'
```


### Logs

```bash
🛠️ Automating Heinz Tomato Ketchup 460ml (3) at https://grroceries.asda.com/product/tomato-ketchup/heinz-tomato-ketchup/47159256
product {
  name: 'Heinz Tomato Ketchup 460ml',
  url: 'https://groceries.asda.com/product/tomato-ketchup/heinz-tomato-ketchup/47159256',
  id: 'PROD-1001',
  vendor_name: 'Asda',
  price: '2.33',
  quantity: '3'
}
✅ Job 1 done
✅ Job 1 completed
🛠️ Automating Heinz Tomato Ketchup 460ml (3) at https://grroceries.asda.com/product/tomato-ketchup/heinz-tomato-ketchup/47159256
✅ Job 2 done
✅ Job 2 completed
```