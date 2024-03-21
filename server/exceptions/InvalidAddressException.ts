import HttpException from "./HttpException";

class InvalidAddressException extends HttpException {
    constructor() {
        super(400, "Not an Ethereum address.");
    }
}

export default InvalidAddressException;
