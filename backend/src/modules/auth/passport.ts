import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import {
    ExtractJwt,
    Strategy as JwtStrategy,
    StrategyOptions as JwtStrategyOptions,
} from 'passport-jwt';
import { UsersService } from '../users';
import { IUser } from 'src/models/User';
import { config } from 'src/config/dotenv';
const optsForAt: JwtStrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.jwtSecretAT,
};

const optsForRt: JwtStrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.jwtSecretRT,
    passReqToCallback: true,
};

// passport.use('local', new LocalStrategy(
//     { passReqToCallback: true, session: false }, async function(req, usernameRaw, password, done) {
//         const lang = req.acceptsLanguages()[0].replace('*', '') || 'en';
//         const username = req.body.username.toLocaleLowerCase(lang);

//         try {
//             const user = await AuthService.findUserFromCredentials(username, password);

//             return done(null, user);
//         } catch (e) {
//             return done(null, false, { message: 'Incorrect username or password' });
//         }
//     },
// ));

passport.use(
    'jwt',
    new JwtStrategy(optsForAt, async function (jwtPayload, done) {
        try {
            const user = await UsersService.show(+jwtPayload.sub);

            return done(null, user);
        } catch (e) {
            return done(null, false);
        }
    }),
);

passport.use(
    'jwt-refresh',
    new JwtStrategy(optsForRt, async function (req, jwtPayload, done) {
        try {
            const user = await UsersService.show(+jwtPayload.sub);
            req.jwtPayload = jwtPayload;

            return done(null, user);
        } catch (e) {
            return done(null, false);
        }
    }),
);

declare global {
    namespace Express {
        interface User extends IUser {}
    }
}
