import dotenv from "dotenv";

dotenv.config()

const ENVIRONMENT = {
    PORT: process.env.PORT || 3000,
    SECRET_KEY_JWT: process.env.JWT_SECRET,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    EMAIL_USERNAME: process.env.EMAIL_USERNAME,
    URL_FRONTED: process.env.URL_FRONTEND, 
    URL_BACKEND: process.env.URL_BACKEND,
    MYSQL: {
        PASSWORD: process.env.MYSQL_PASSWORD,
        HOST: process.env.MYSQL_HOST,
        DB_NAME: process.env.MYSQL_DB_NAME,
        USERNAME: process.env.MYSQL_USERNAME
    },
}

export default ENVIRONMENT