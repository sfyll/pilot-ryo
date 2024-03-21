import HttpException from "./HttpException";

class PlayerAtHomeException extends HttpException {
    constructor() {
        super(403, `Player is at Home, no markets available`);
    }
}

export default PlayerAtHomeException;
