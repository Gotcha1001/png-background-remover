import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || file.size === 0) {
      console.error("No file uploaded");
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!process.env.REMOVE_BG_API_KEY) {
      console.error("Remove.bg API key is missing in environment variables");
      return NextResponse.json(
        { error: "Server configuration error: Missing API key" },
        { status: 500 }
      );
    }

    const response = await axios.post(
      "https://api.remove.bg/v1.0/removebg",
      { image_file: file },
      {
        headers: {
          "X-Api-Key": process.env.REMOVE_BG_API_KEY,
          "Content-Type": "multipart/form-data",
        },
        responseType: "arraybuffer",
      }
    );

    const base64Data = Buffer.from(response.data).toString("base64");
    if (!base64Data || base64Data.trim() === "") {
      console.error("Remove.bg API returned empty data");
      return NextResponse.json(
        { error: "Invalid image data from Remove.bg" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: base64Data }, { status: 200 });
  } catch (err) {
    console.error("Remove.bg API error:", {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data
        ? Buffer.from(err.response.data).toString("utf-8")
        : null,
    });

    let errorMessage = "Error processing image";
    if (err.response?.status === 402) {
      errorMessage = "Remove.bg API quota exceeded";
    } else if (err.response?.status === 400) {
      errorMessage = "Invalid image format or size";
    } else if (err.response?.status === 401) {
      errorMessage = "Invalid Remove.bg API key";
    } else if (err.code === "ECONNABORTED" || err.code === "ETIMEDOUT") {
      errorMessage = "Request to Remove.bg timed out";
    }

    return NextResponse.json(
      { error: `${errorMessage}: ${err.message}` },
      { status: err.response?.status || 500 }
    );
  }
}
