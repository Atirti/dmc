from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, products, cart, orders


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(cart.router)
app.include_router(orders.router)