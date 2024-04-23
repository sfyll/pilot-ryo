import { plainToClass } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import { RequestHandler } from "express";

import HttpException from "../exceptions/HttpException";

/*
 * Validates that an incoming request object is consistent with specs in a DTO
 * file.
 */
function validationMiddleware<T>(
    type: any,
    skipMissingProperties = false,
    target: 'body' | 'query' = 'body'
): RequestHandler {
    return (req, res, next) => {
        const dataToValidate = target === 'body' ? req.body : req.query;
        validate(plainToClass(type, dataToValidate), { skipMissingProperties }).then(
            (errors: ValidationError[]) => {
                if (errors.length > 0) {
                    const message = errors
                        .map((error: ValidationError) => {
                            if (error.constraints) {
                                return Object.values(error.constraints);
                            }
                            return [];
                        })
                        .join(", ");
                    next(new HttpException(400, message));
                } else {
                    next();
                }
            },
        );
    };
}

export default validationMiddleware;
