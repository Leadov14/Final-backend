import dotenv from 'dotenv';

dotenv.config()

const MONGO_URI = process.env.MONGO_URI
const PORT = process.env.PORT || 3000
const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRA = process.env.JWT_EXPIRA || "2h"

export {MONGO_URI, PORT, JWT_SECRET, JWT_EXPIRA}