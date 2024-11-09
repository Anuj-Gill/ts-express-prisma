import crypto from "crypto";

const secretKey = process.env.CODE_SECRET;

const key = crypto.createHash("sha256").update(secretKey).digest();
const iv = crypto.createHash("md5").update(secretKey).digest();

export default function decrypt(code) {
  const [ivBase64, encryptedData] = code.split(":");
  const algorithm = "aes-256-cbc";
  const decipher = crypto.createDecipheriv(
    algorithm,
    secretKey,
    Buffer.from(ivBase64, "base64"),
  );
  let decrypted = decipher.update(encryptedData, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
