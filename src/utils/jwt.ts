import jwt, { type JwtPayload } from "jsonwebtoken";

class JWT {
    /**
     * @access jwt.generateToken(id)
     * @param id string
     * @returns Promise<string>
     * @description This method is used to sign new jwt token
     */
    async generateToken(id: string): Promise<string> {
        const token = jwt.sign({ id }, process.env.JWT_SECRET as string, {
            expiresIn: "2h",
        });

        return token;
    }

    /**
     * @access jwt.verifyToken(token)
     * @param token string
     * @returns string | JwtPayload
     * @description This method is used to verify the jwt token
     */
    async verifyToken(token: string): Promise<string | JwtPayload> {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        return decoded;
    }
}

export default new JWT();
