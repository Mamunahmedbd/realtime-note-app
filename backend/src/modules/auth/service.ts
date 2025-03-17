import jwt from 'jsonwebtoken';
import * as argon2 from '@node-rs/argon2';
import {
    convertToSeconds,
    formatSqliteDate,
    NotFoundException,
    UnprocessableEntityException,
} from '../../utils';
import { IUser } from 'src/models/User';
import { RefreshTokenModel, RtPayload } from 'src/models/Auth';
import { config } from '../../config/dotenv';
import { parseRefreshToken } from 'src/utils/parse-refresh-token';

const allTokenSettings = {
    accessToken: {
        expiresIn: config.accessTokenExpiresIn, // 5 minutes
        secret: config.jwtSecretAT,
    },
    refreshToken: {
        expiresIn: config.refreshTokenExpiresIn, // 1 day
        secret: config.jwtSecretRT,
    },
};

class AuthService {
    async generateAuthTokens(
        user: IUser,
        oldRtPayload?: RtPayload,
    ): Promise<{
        accessToken: string;
        refreshToken: string;
    }> {
        const now = new Date();

        const accessToken = await this.generateAuthToken(user, 'accessToken', now);
        const refreshToken = await this.generateAuthToken(user, 'refreshToken', now, oldRtPayload);

        return { accessToken, refreshToken };
    }

    async revokeRefreshToken(userId: number) {
        const refreshTokenDb = await RefreshTokenModel.findOne({ userId }).sort({
            expiresAt: -1,
        });

        if (!refreshTokenDb) {
            throw new NotFoundException('Refresh token not found');
        }

        const refreshToken = parseRefreshToken(refreshTokenDb);

        if (refreshToken.revokedAt) {
            throw new UnprocessableEntityException('Refresh token already revoked');
        }

        console.log({ refreshTokenDb });
        console.log({ refreshToken });

        // Update using _id instead of id
        await RefreshTokenModel.findOneAndUpdate(
            { _id: refreshTokenDb._id }, // Fix: Use `_id` instead of `id`
            { revokedAt: formatSqliteDate(new Date()) },
            { new: true }, // Optional: Returns the updated document
        );

        return true;
    }

    // async revokeAllRefreshTokensOfUser(userId: number) {
    //     const revokedTokensCount = await RefreshTokens()
    //         .where({
    //             userId,
    //             revokedAt: null,
    //         })
    //         .update({
    //             revokedAt: formatSqliteDate(new Date()),
    //         });

    //     return revokedTokensCount;
    // }

    private async generateAuthToken(
        user: IUser,
        type: 'accessToken' | 'refreshToken',
        iat: Date,
        oldRtPayload?: RtPayload,
    ) {
        let jti: number | undefined;

        const iatDate = new Date(iat);
        iatDate.setMilliseconds(0);

        const tokenSettings = allTokenSettings[type];

        const tokenExpiresIn = tokenSettings.expiresIn;
        const tokenExpiresAt = new Date(iatDate);
        tokenExpiresAt.setSeconds(tokenExpiresAt.getSeconds() + tokenExpiresIn, 0);

        if (type === 'refreshToken') {
            jti = await this.upsertRefreshToken({
                userId: user.id,
                issuedAt: iatDate,
                tokenExpiresAt,
                oldRtPayload,
            });
        }

        // We generate iat (issued at) and exp (expiration) manually because of better precision
        const iatAsSeconds = convertToSeconds(iatDate);
        const exp = convertToSeconds(tokenExpiresAt);

        const secret = tokenSettings.secret;

        // You can add more data to the token if you want but make sure to add it also to the AtPayload and RtPayload types
        const token = jwt.sign(
            {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                },
                jti,
                iat: iatAsSeconds,
                exp,
            },
            secret,
        );

        return token;
    }

    private async upsertRefreshToken({
        userId,
        issuedAt,
        tokenExpiresAt,
        oldRtPayload,
    }: {
        userId: number;
        issuedAt: Date;
        tokenExpiresAt: Date;
        oldRtPayload: RtPayload | undefined;
    }) {
        let jti = oldRtPayload?.jti;
        const tokenExpiresAtString = formatSqliteDate(tokenExpiresAt);
        const iatString = formatSqliteDate(issuedAt);

        if (!oldRtPayload) {
            // We need to store the jti of the refresh token in the database
            const refreshTokenDb = new RefreshTokenModel({
                userId,
                expiresAt: tokenExpiresAtString,
            });
            await refreshTokenDb.save();
            jti = refreshTokenDb.id;
        } else {
            const refreshTokenDb = await RefreshTokenModel.findById(jti);

            if (!refreshTokenDb) {
                throw new NotFoundException('Invalid refresh token');
            }

            const refreshToken = parseRefreshToken(refreshTokenDb);

            console.log({ refreshToken });

            if (!refreshToken) {
                throw new NotFoundException('Refresh token not found');
            }

            if (refreshToken.revokedAt) {
                throw new UnprocessableEntityException('Refresh token revoked');
            }

            if (refreshToken.expiresAt < new Date()) {
                throw new UnprocessableEntityException('Refresh token expired');
            }

            const refreshTokenDbIssuedAt = refreshToken.updatedAt;

            const oldRefreshTokenIssuedAt = new Date(0);
            oldRefreshTokenIssuedAt.setUTCSeconds(oldRtPayload.iat);

            // We need to check if these dates are equal because we need to make sure that the refresh token is not used
            // after it was updated in the database
            if (refreshTokenDbIssuedAt.getTime() !== oldRefreshTokenIssuedAt.getTime()) {
                throw new UnprocessableEntityException('Refresh token already consumed');
            }

            // We need to update the expiration date of the refresh token in the database
            await RefreshTokenModel.findByIdAndUpdate(jti, {
                expiresAt: tokenExpiresAtString,
                updatedAt: iatString,
            });
        }

        return jti!;
    }
}

const service = new AuthService();
export { service as AuthService };
