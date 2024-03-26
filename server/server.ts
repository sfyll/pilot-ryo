import dotenv from "dotenv";
dotenv.config();

import App from "./app";

import AuthenticationService from "./authentication/authentication.service";
import AuthenticationController from "./authentication/authentication.controller";
import { getRyoController } from "./ryo/ryo.controller";

const authenticationService = new AuthenticationService();
const app = new App(authenticationService, [
    new AuthenticationController(authenticationService),
    await getRyoController()    
]);

app.listen();

