import HttpException from "./HttpException";

class MissingPreimageException extends HttpException {
    constructor() {
        super(
            500,
            "Attempted to confirm a hash without knowledge of preimage.",
        );
    }
}

export default MissingPreimageException;
