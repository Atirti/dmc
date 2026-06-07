from fastapi import FastAPI
from routers import auth, products, cart, orders


app = FastAPI()

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(cart.router)
app.include_router(orders.router)