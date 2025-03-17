import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: process.env.PORT || 5000,
    jwtSecretAT: process.env.JWT_SECRET_AT as string,
    accessTokenExpiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN) || 3000,
    jwtSecretRT: process.env.JWT_SECRET_RT as string,
    refreshTokenExpiresIn: Number(process.env.REFRESH_TOKEN_EXPIRES_IN) || 86400,
    mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/realtime-note',
};
