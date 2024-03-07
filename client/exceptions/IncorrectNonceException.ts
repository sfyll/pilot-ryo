import HttpException from "./HttpException";

class IncorrectNonceException extends HttpException {
    constructor() {
        super(401, `Incorrect nonce submitted.`);
    }
}

export default IncorrectNonceException;
