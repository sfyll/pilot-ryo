import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from "class-validator";

/*
 * Checks whether a string can be interpreted as a BigInt. For use in DTO files.
 */
@ValidatorConstraint({ async: false })
export class IsBigIntStringConstraint implements ValidatorConstraintInterface {
    validate(text: string) {
        try {
            BigInt(text);
            return true;
        } catch {
            return false;
        }
    }
}

/*
 * Decorator for IsBigIntStringConstraint.
 */
export function IsBigIntString(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsBigIntStringConstraint,
        });
    };
}

/*
 * Recursively stringifies any BigInts present in a nested object.
 */
export function stringifyBigInts(obj: any): any {
    if (typeof obj !== "object") {
        if (typeof obj === "bigint") {
            return obj.toString();
        }
        return obj;
    }
    const newObj = { ...obj };
    for (const key in newObj) {
        newObj[key] = stringifyBigInts(newObj[key]);
    }
    return newObj;
}

