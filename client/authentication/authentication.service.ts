class AuthenticationService {
    private nonces: Map<string, BigInt> = new Map();

    /*
     * Returns current nonce of address.
     */
    public getNonce(address: string): BigInt {
        return this.nonces.get(address) ?? BigInt(0);
    }

    /*
     * Increments nonce of a given address, beginning at 0.
     */
    public incrementNonce(address: string) {
        if (!this.nonces.has(address)) {
            this.nonces.set(address, BigInt(0));
        }
        const currentVal = (this.nonces.get(address) ?? BigInt(0)) as bigint;
        this.nonces.set(address, currentVal + BigInt(1));
    }
}

export default AuthenticationService;
