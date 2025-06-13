import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const response = await axios.post(
      "https://api.remove.bg/v1.0/removebg",
      formData,
      {
        headers: {
          "X-Api-Key": process.env.REMOVE_BG_API_KEY,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    const base64 = `data:image/png;base64,${response.data.data.result_b64}`;
    return NextResponse.json({ image: base64 }, { status: 200 });
  } catch (err) {
    console.error("Error in /api/remove-background:", err.message, err.stack);
    return NextResponse.json(
      { error: `Error processing image: ${err.message}` },
      { status: 500 }
    );
  }
}
