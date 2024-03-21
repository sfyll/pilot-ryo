import HttpException from "./HttpException";

class PlayerAtHomeException extends HttpException {
    constructor() {
        super(406, `Player is at Home, no markets available`);
    }
}

export default PlayerAtHomeException;
