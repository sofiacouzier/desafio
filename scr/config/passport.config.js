import passport from 'passport';
import local from 'passport-local';
import userModel from '../dao/mongo/models/users.js';
import { cookieExtractor } from '../utils.js';
import { createHash, validatePassword } from '../services/auth.js';
import GithubStrategy from 'passport-github2';
import { Strategy, ExtractJwt } from 'passport-jwt';
import UsersManager from '../dao/mongo/Managers/users.js';
import { userService } from '../services/index.js';


const LocalStrategy = local.Strategy; // UNA ESTRATEGIA LOCAL SIEMPRE SE BASA EN EL USERNAME + PASSWORD

const initializePassportStrategies = () => {
    passport.use(
        'register',
        new LocalStrategy(
            { passReqToCallback: true, usernameField: 'email' },
            async (req, email, password, done) => {
                try {
                    const { first_name, last_name, role } = req.body;
                    // el usuario ya existe?
                    const exists = await userService.getUserBy({ email });
                    if (exists)
                        return done(null, false, { message: 'El usuario ya existe' });
                    //no existe
                    const hashedPassword = await createHash(password);
                    //Número 3! Construimos el usuario que voy a registrar
                    const user = {
                        first_name,
                        last_name,
                        email,
                        role,
                        password: hashedPassword,
                    };
                    const result = await userService.createUser(user);
                    //Si todo salió bien, Ahí es cuando done debe finalizar bien.
                    done(null, result);
                } catch (error) {
                    done(error);
                }
            }
        )
    );

    passport.use('login',
        new LocalStrategy(
            { usernameField: 'email' },
            async (email, password, done) => {
                let resultUser;
                try {
                    if (email === "admin@admin.com" && password === "123") {
                        //Acaba de entrar como SUPER ADMIN
                        resultUser = {
                            name: "Admin",
                            id: 0,
                            email: "admin@mail",
                            role: 'superadmin'
                        }
                        return done(null, resultUser);
                    }
                    //buscar al usuario
                    const user = await userService.getUserBy({ email });
                    if (!user) return done(null, false, { message: 'Credenciales incorrectas' });
                    //Número 2!!!! si sí existe el usuario, verificar password.

                    const valid = await validatePassword(password, user.password)
                    if (!valid) {
                        return done(null, false, { message: 'Contraseña inválida' });
                    }

                    resultUser = {
                        id: user._id,
                        name: `${user.first_name} ${user.last_name}`,
                        email: user.email,
                        role: user.role,
                    }

                    return done(null, resultUser);

                } catch (error) {
                    return done(error)
                }
            }

        ))
    passport.use('github',
        new GithubStrategy(
            {
                clientID: 'Iv1.34b35ad96487fcab',
                clientSecret: 'e668e0195c60394abfb251de2e0a496137baea85',
                callbackURL: 'http://localhost:8080/api/sessions/githubcallback',
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    console.log(profile);
                    //Tomo los datos que me sirvan.
                    const { name, email } = profile._json;
                    const user = await userService.getUserBy({ email });
                    //DEBO GESTIONAR AMBAS LÓGICAS AQUÍ, OMG!!!
                    if (!user) {
                        //No existe? lo creo entonces.
                        const newUser = {
                            first_name: name,
                            email,
                            password: ''
                        }
                        const result = await userService.createUser(newUser);
                        done(null, result);
                    }
                    //Si el usuario ya existía, Qué mejor!!! 
                    done(null, user);
                } catch (error) {
                    done(error);
                }
            }
        ))
    //verifico token de manera mas prolija
    passport.use('jwt', new Strategy({
        jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
        secretOrKey: 'jwtSecret',
    }, async (payload, done) => {
        try {
            console.log(payload)
            return done(null, payload);
        } catch (error) {
            return done(error)
        }

    }))



}
export default initializePassportStrategies;