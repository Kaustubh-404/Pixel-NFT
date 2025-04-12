import { NextResponse } from "next/server"
import fetch from "node-fetch"

export async function POST(request: Request) {
  try {
    const { prompts } = await request.json()

    if (!prompts || !Array.isArray(prompts) || prompts.length === 0) {
      return NextResponse.json({ error: "Valid prompts array is required" }, { status: 400 })
    }

    // Generate images for each prompt
    const imagePromises = prompts.map(async (prompt, index) => {
      console.log(`Generating image ${index + 1}/${prompts.length} with prompt: ${prompt}`)

      try {
        const response = await fetch("https://anura-testnet.lilypad.tech/api/v1/image/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.ANURA_API_KEY}`,
          },
          body: JSON.stringify({
            prompt: `${prompt}, pixel art style, 8-bit graphics, detailed, vibrant colors`,
            model: "sdxl-turbo",
            // Add pixel art specific parameters
            width: 512,
            height: 512,
            num_inference_steps: 30,
            guidance_scale: 7.5,
          }),
        })

        if (!response.ok) {
          console.error(`Error response: ${response.status} ${response.statusText}`)
          const errorText = await response.text()
          console.error(`Error details: ${errorText}`)
          throw new Error(`Error generating image: StatusCode: ${response.status}`)
        }

        // Convert the image to base64 for frontend display
        const buffer = await response.arrayBuffer()
        const base64Image = `data:image/png;base64,${Buffer.from(buffer).toString("base64")}`

        return base64Image
      } catch (error) {
        console.error(`Error generating image for prompt ${index + 1}:`, error)
        throw error
      }
    })

    // Wait for all images to be generated with error handling
    const results = await Promise.allSettled(imagePromises)

    // Filter successful results and handle errors
    const successfulImages = results
      .filter((result): result is PromiseFulfilledResult<string> => result.status === "fulfilled")
      .map((result) => result.value)

    const errors = results
      .filter((result): result is PromiseRejectedResult => result.status === "rejected")
      .map((result) => result.reason)

    if (errors.length > 0) {
      console.error("Some images failed to generate:", errors)
    }

    if (successfulImages.length === 0) {
      return NextResponse.json({ error: "Failed to generate any images" }, { status: 500 })
    }

    return NextResponse.json({
      images: successfulImages,
      totalRequested: prompts.length,
      totalGenerated: successfulImages.length,
    })
  } catch (error) {
    console.error("Error generating images:", error)
    return NextResponse.json({ error: "Failed to generate images" }, { status: 500 })
  }
}
