import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

interface JWTData {
  email: string;
  role: string;
}

export default function CreateJwt(data: JwtData): string | undefined {
  try {
    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) throw new Error("Secret key not defined");

    const token = jwt.sign(data, secretKey, {
      algorithm: "RSA256",
    } as SignOptions);

    return token;
  } catch (error) {
    console.error("Error creating JWT: ", error);
  }
}

export async function verifyToken(
  token: string,
): Promise<JwtPayload | undefined> {
  try {
    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) throw new Error("Secret key not defined!");

    const decoded = jwt.verify(token, secretKey) as JwtPayload;
    return decoded;
  } catch (err) {
    throw new Error("Authentication failed:".err.message);
  }
}
