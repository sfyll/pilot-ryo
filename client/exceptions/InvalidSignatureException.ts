import HttpException from "./HttpException";

class InvalidSignatureException extends HttpException {
    constructor() {
        super(400, `Signature is not well formed.`);
    }
}

export default InvalidSignatureException;
