// app/api/generate-prompts/route.ts
import { NextResponse } from "next/server"
import OpenAI from "openai"

export async function POST(request: Request) {
  try {
    const { theme, count = 1 } = await request.json()

    if (!theme) {
      return NextResponse.json({ error: "Theme is required" }, { status: 400 })
    }

    // Initialize Lilypad client
    const client = new OpenAI({
      baseURL: "https://anura-testnet.lilypad.tech/api/v1",
      apiKey: process.env.ANURA_API_KEY,
    })

    // Generate prompts using Llama 3.1
    const completion = await client.chat.completions.create({
      model: "llama3.1:8b",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant specialized in creating pixel art prompts.",
        },
        {
          role: "user",
          content: `Give me ${count} prompts for pixel art NFTs to be given to stable diffusion XL model. They should be small, detailed and in phrases, not full sentences. I am making NFTs based on ${theme}. Make the prompts varied in complexity and design, and ensure about 10% reference gold or rare elements, 30% should include terms like 'vibrant' or 'detailed', and the rest should be standard. Give me prompts in one line and not in different lines. Sample prompt - "haunted house, pixel-art, low-res, blocky, pixel art style, 8-bit graphics, colorful"`,
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
        .slice(0, count) // Limit to requested count
    }

    // Ensure all prompts have pixel art styling
    prompts = prompts.map((prompt) => {
      if (!prompt.toLowerCase().includes("pixel") && !prompt.toLowerCase().includes("8-bit")) {
        return `${prompt}, pixel-art, 8-bit style, low-res`
      }
      return prompt
    })

    // If we still don't have enough prompts, generate some generic ones to fill
    while (prompts.length < count) {
      prompts.push(`${theme} in pixel art style, 8-bit graphics, vibrant colors, detailed, ${prompts.length % 3 === 0 ? 'rare, golden elements' : 'retro aesthetic'}`)
    }

    return NextResponse.json({ prompts: prompts.slice(0, count) })
  } catch (error) {
    console.error("Error generating prompts:", error)
    return NextResponse.json({ error: "Failed to generate prompts" }, { status: 500 })
  }
}

// import { NextResponse } from "next/server"
// import OpenAI from "openai"

// export async function POST(request: Request) {
//   try {
//     const { theme } = await request.json()

//     if (!theme) {
//       return NextResponse.json({ error: "Theme is required" }, { status: 400 })
//     }

//     // Initialize Lilypad client
//     const client = new OpenAI({
//       baseURL: "https://anura-testnet.lilypad.tech/api/v1",
//       apiKey: process.env.ANURA_API_KEY,
//     })

//     // Generate prompts using Llama 3.1
//     const completion = await client.chat.completions.create({
//       model: "llama3.1:8b",
//       messages: [
//         {
//           role: "system",
//           content: "You are a helpful AI assistant specialized in creating pixel art prompts.",
//         },
//         {
//           role: "user",
//           content: `Give me 4 prompts for pixel art NFTs to be given to stable diffusion XL model. They should be small, detailed and in phrases, not full sentences. I am making NFTs based on ${theme} and having the gold color for rare ones. Give me prompts in one line and not in different lines. Sample prompt - "haunted house, pixel-art, low-res, blocky, pixel art style, 8-bit graphics, colorful"`,
//         },
//       ],
//     })

//     // Extract and format prompts
//     const promptsText = completion.choices[0].message.content || ""

//     // Parse the response to extract individual prompts
//     let prompts: string[] = []

//     if (promptsText.includes("1.")) {
//       // If the model returned numbered prompts
//       prompts = promptsText
//         .split(/\d+\.\s+/)
//         .filter(Boolean)
//         .map((prompt) => prompt.trim())
//     } else {
//       // If the model returned prompts separated by newlines or other delimiters
//       prompts = promptsText
//         .split(/\n|;|,\s*(?=\w+\s+\w+)/)
//         .filter(Boolean)
//         .map((prompt) => prompt.trim())
//         .slice(0, 4) // Limit to 4 prompts
//     }

//     // Ensure all prompts have pixel art styling
//     prompts = prompts.map((prompt) => {
//       if (!prompt.toLowerCase().includes("pixel") && !prompt.toLowerCase().includes("8-bit")) {
//         return `${prompt}, pixel-art, 8-bit style, low-res`
//       }
//       return prompt
//     })

//     return NextResponse.json({ prompts })
//   } catch (error) {
//     console.error("Error generating prompts:", error)
//     return NextResponse.json({ error: "Failed to generate prompts" }, { status: 500 })
//   }
// }
