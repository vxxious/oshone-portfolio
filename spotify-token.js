import dotenv from "dotenv";

dotenv.config();

const params = new URLSearchParams({
  grant_type: "authorization_code",
  code: process.env.SPOTIFY_CODE,
  redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
});

const credentials = Buffer.from(
  `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
).toString("base64");

const response = await fetch("https://accounts.spotify.com/api/token", {
  method: "POST",
  headers: {
    Authorization: `Basic ${credentials}`,
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body: params,
});

const data = await response.json();

console.log(data);