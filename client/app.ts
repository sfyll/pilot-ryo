// starter template credit: https://github.com/mwanago/express-typescript/tree/master

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import Controller from "./interfaces/controller.interface";
import errorMiddleware from "./middleware/error.middleware";
import AuthenticationService from "./authentication/authentication.service";

class App {
    public app: express.Application;

    constructor(
        authenticationService: AuthenticationService,
        controllers: Controller[],
    ) {
        this.app = express();
        this.authorizeClient();
        this.initializeMiddlewares();
        this.initializeAuthentication(authenticationService);
        this.initializeControllers(controllers);
        this.initializeErrorHandling();
    }

    public listen() {
        this.app.listen(process.env.PORT, () => {
            console.log(` == App listening on port ${process.env.PORT}`);
        });
    }

    public getServer(): express.Application {
        return this.app;
    }

    private authorizeClient() {
        const corsOptions = {
            origin: process.env.CLIENT_URL 
        }
        this.app.use(cors(corsOptions))
    }

    private initializeControllers(controllers: Controller[]) {
        controllers.forEach((controller) => {
            this.app.use("/", controller.router);
        });
    }

    private initializeMiddlewares() {
        this.app.use(bodyParser.json());
    }

    private initializeAuthentication(
        authenticationService: AuthenticationService,
    ) {
        this.app.set("authenticationService", authenticationService);
    }

    private initializeErrorHandling() {
        this.app.use(errorMiddleware);
    }
}

export default App;
