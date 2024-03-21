import HttpException from "./HttpException";

class IncorrectPlayerDataException extends HttpException {
    constructor() {
        super(401, `Incorrect nonce submitted.`);
    }
}

export default IncorrectPlayerDataException;
