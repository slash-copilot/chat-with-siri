
import fs from "fs"
import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
    const body = await req.json()
    const base64Audio = body.audio
    const audio = Buffer.from(base64Audio, "base64")
    const filePath = "tmp/input.wav"

    try {
      fs.writeFileSync(filePath, audio)
      const readStream = fs.createReadStream(filePath)
      const data = await openai.audio.transcriptions.create({
        file: readStream,
        model: "whisper-1",
      })
      // Remove the file after use
      //fs.unlinkSync(filePath)
      console.log("openai transcriptions: ", data)
      return NextResponse.json(data)
    } catch (error:any) {
      console.error("Error processing audio:", error);

      let errorMessage = error.message || "录音时间太短，请重新开始";
      if (errorMessage.includes("Audio file is too short")) {
        errorMessage = "录音时间太短，请重新开始";
      }

    return NextResponse.json({ text: "", error: errorMessage});
  }
}