import dotenv from "dotenv";
dotenv.config();

import request from "supertest";
import { PrivateKeyAccount, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import App from "../../app";
import AuthenticationService from "../authentication.service";
import AuthenticationController from "../authentication.controller";
import {
    nonceActionDomain,
    nonceActionTypes,
    nonceActionTypeLabel,
} from "../authentication.types";
import { signTypedData } from "../../utils/signature";

describe("/authentication", () => {
    let app: App;
    let walletClient: any;
    let authenticationController: AuthenticationController;
    let account1: PrivateKeyAccount;

    beforeEach(() => {
        const authenticationService = new AuthenticationService();
        authenticationController = new AuthenticationController(
            authenticationService,
        );
        app = new App(authenticationService, [authenticationController]);

        account1 = privateKeyToAccount(`0x${process.env.W1_PRIVKEY}`);

        walletClient = createWalletClient({
            transport: http(process.env.RPC_URL),
        });
    });

    describe("GET /nonce", () => {
        it("should reject strings that aren't ETH addresses", () => {
            return request(app.getServer())
                .get(`${authenticationController.path}/nonce`)
                .send({ address: "notanaddr" })
                .expect(400);
        });

        it("should start at 0 nonce", () => {
            return request(app.getServer())
                .get(`${authenticationController.path}/nonce`)
                .send({ address: account1.address })
                .expect(200)
                .expect("Content-Type", /json/)
                .expect({ nonce: BigInt(0).toString() });
        });
    });

    describe("POST /action", () => {
        it("should increment nonce by one with each action", async () => {
            const tx = { nonce: BigInt(0).toString(), body: {} };
            const signature = await signTypedData(
                walletClient,
                account1,
                nonceActionTypes,
                `${nonceActionTypeLabel}Tx`,
                nonceActionDomain,
                tx,
            );

            await request(app.getServer())
                .post(`${authenticationController.path}/action`)
                .send({ tx, signature })
                .expect(200);

            return request(app.getServer())
                .get(`${authenticationController.path}/nonce`)
                .send({ address: account1.address })
                .expect(200)
                .expect("Content-Type", /json/)
                .expect({ nonce: BigInt(1).toString() });
        });

        it("should error when trying the same nonce twice", async () => {
            const tx = { nonce: BigInt(0).toString(), body: {} };
            const signature = await signTypedData(
                walletClient,
                account1,
                nonceActionTypes,
                `${nonceActionTypeLabel}Tx`,
                nonceActionDomain,
                tx,
            );

            await request(app.getServer())
                .post(`${authenticationController.path}/action`)
                .send({ tx, signature })
                .expect(200);

            return request(app.getServer())
                .post(`${authenticationController.path}/action`)
                .send({ tx, signature })
                .expect(401);
        });

        it("should work w/ correct nonce, multiple actions", async () => {
            let tx = { nonce: BigInt(0).toString(), body: {} };
            let signature = await signTypedData(
                walletClient,
                account1,
                nonceActionTypes,
                `${nonceActionTypeLabel}Tx`,
                nonceActionDomain,
                tx,
            );
            await request(app.getServer())
                .post(`${authenticationController.path}/action`)
                .send({ tx, signature })
                .expect(200);

            tx = { nonce: BigInt(1).toString(), body: {} };
            signature = await signTypedData(
                walletClient,
                account1,
                nonceActionTypes,
                `${nonceActionTypeLabel}Tx`,
                nonceActionDomain,
                tx,
            );
            await request(app.getServer())
                .post(`${authenticationController.path}/action`)
                .send({ tx, signature })
                .expect(200);

            tx = { nonce: BigInt(2).toString(), body: {} };
            signature = await signTypedData(
                walletClient,
                account1,
                nonceActionTypes,
                `${nonceActionTypeLabel}Tx`,
                nonceActionDomain,
                tx,
            );
            return request(app.getServer())
                .post(`${authenticationController.path}/action`)
                .send({ tx, signature })
                .expect(200);
        });
    });
});
