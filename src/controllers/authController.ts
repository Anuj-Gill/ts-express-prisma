import { Request, Response } from "express";
import axios from "axios";
import { PrismaClient } from "@prisma/client";
import decrypt from "../services/roleCodeService";

const prisma = new PrismaClient();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI =
  process.env.REDIRECT_URI || "http://localhost:5000/auth/google/callback";

export const getGoogleAuthUrl = (req: Request, res: Response) => {
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=profile email&access_type=offline&prompt=consent`;
  res.json({ authUrl });
};

export const googleAuthCallback = async (req: Request, res: Response) => {
  const { code } = req.query;

  try {
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      },
    );
    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Log the tokens for testing purposes
    console.log("Access Token:", access_token);
    console.log("Refresh Token:", refresh_token);
    console.log("Access Token Expiry (in seconds):", expires_in);

    // Calculate and log the exact expiration time based on the current time
    const accessTokenExpiryDate = new Date(Date.now() + expires_in * 1000);
    console.log(
      "Access Token Expiry Date:",
      accessTokenExpiryDate.toISOString(),
    );

    const profileResponse = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${access_token}`,
    );
    const profile = profileResponse.data;
    console.log(profile);
    res.send(`
			<script>
			// Send user data to the main window
			window.opener.postMessage(${JSON.stringify(profile)}, '*');
			// Close the popup
			window.close();
			</script>
		`);
  } catch (error) {
    console.error("Error exchanging code for token:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, code } = req.body;
    console.log(req.body);
    let roleDetails;
    if (code.length !== 0) {
      roleDetails = await prisma.role.findFirst({
        where: {
          roleCode: {
            endsWith: code,
          },
        },
      });
    } else {
      roleDetails = await prisma.role.findFirst({
        where: {
          roleName: "User",
        },
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    console.log(existingUser);

    if (existingUser) {
      return res.status(409).json({ message: "User already exists!" });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password,
        gender: "your_default_gender_value", // or get from request body
        roleId: roleDetails ? roleDetails.id : 2,
      },
    });

    return res.status(200).json({ message: "User created  successfully!" });
  } catch (error) {
    console.error("Error during signup:", error);
    return res
      .status(500)
      .json({
        message: "An error occurred during signup. Please try again later.",
      });
  }
};
