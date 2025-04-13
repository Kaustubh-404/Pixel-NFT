import { NextResponse } from "next/server"
import OpenAI from "openai"

export async function POST(request: Request) {
  try {
    const { theme, numPrompts } = await request.json()

    if (!theme) {
      return NextResponse.json({ error: "Theme is required" }, { status: 400 })
    }

    // Initialize Lilypad client
    const client = new OpenAI({
      baseURL: "https://anura-testnet.lilypad.tech/api/v1",
      apiKey: process.env.LILYPAD_API_KEY,
    })

    // Generate prompts using Llama 3.1
    const completion = await client.chat.completions.create({
      model: "llama3.1:8b",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant specialized in creating pixel art prompts to be given to stable diffusion XL model.",
        },
        {
          role: "user",
          content: `Give me ${numPrompts} prompts for pixel art NFTs to be given to stable diffusion XL model. They should be small, detailed and in phrases, not full sentences. I am making NFTs based on ${theme} and having the gold color for rare ones. Give me prompts in one line and not in different lines. Your reply should only be the prompts and they should be in quotes and seperated by commas. Sample prompt - "haunted house, pixel-art, low-res, blocky, pixel art style, 8-bit graphics, colorful"`,
        },
      ],
    })

    // Extract and format prompts
    const promptsText = completion.choices[0].message.content || ""

    // Parse the response to extract individual prompts
    let prompts: string[] = []

    if (promptsText.includes("1.")) {
      // If the model returned numbered prompts
      prompts = promptsText
        .split(/\d+\.\s+/)
        .filter(Boolean)
        .map((prompt) => prompt.trim())
    } else {
      // If the model returned prompts separated by newlines or other delimiters
      prompts = promptsText
        .split(/\n|;|,\s*(?=\w+\s+\w+)/)
        .filter(Boolean)
        .map((prompt) => prompt.trim())
        .slice(0, 4) // Limit to 4 prompts
    }

    // Ensure all prompts have pixel art styling
    prompts = prompts.map((prompt) => {
      if (!prompt.toLowerCase().includes("pixel") && !prompt.toLowerCase().includes("8-bit")) {
        return `${prompt}, pixel-art, 8-bit style, low-res`
      }
      return prompt
    })

    return NextResponse.json({ prompts })
  } catch (error) {
    console.error("Error generating prompts:", error)
    return NextResponse.json({ error: "Failed to generate prompts" }, { status: 500 })
  }
}
