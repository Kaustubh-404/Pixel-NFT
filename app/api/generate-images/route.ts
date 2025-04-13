// app/api/generate-images/route.ts
import { NextResponse } from "next/server"
import fetch from "node-fetch"
import { analyzePromptForRarity } from "@/lib/nft/rarity-analyzer"
import { Rarity } from "@/lib/contracts/nft-contract"

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
        // Analyze the prompt to determine rarity
        const rarity = analyzePromptForRarity(prompt)
        
        // Adjust generation parameters based on rarity
        let additionalParams = {}
        
        if (rarity === Rarity.S_TIER) {
          // For S-tier, enhance the prompt to ensure gold accents
          prompt = `${prompt}, gold accents, premium details, legendary pixel art`
          additionalParams = {
            guidance_scale: 8.5, // Higher guidance scale for more accurate adherence to prompt
            num_inference_steps: 35 // More steps for higher quality
          }
        } else if (rarity === Rarity.A_TIER) {
          // For A-tier, enhance with some special effects
          prompt = `${prompt}, vibrant, detailed, silver accents, high quality pixel art`
          additionalParams = {
            guidance_scale: 8.0,
            num_inference_steps: 32
          }
        }

        const response = await fetch("https://anura-testnet.lilypad.tech/api/v1/image/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.ANURA_API_KEY}`,
          },
          body: JSON.stringify({
            prompt: `${prompt}, pixel art style, 8-bit graphics, detailed, vibrant colors`,
            model: "sdxl-turbo",
            // Base pixel art specific parameters
            width: 512,
            height: 512,
            num_inference_steps: 30,
            guidance_scale: 7.5,
            ...additionalParams
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

        return {
          image: base64Image,
          rarity,
          prompt
        }
      } catch (error) {
        console.error(`Error generating image for prompt ${index + 1}:`, error)
        throw error
      }
    })

    // Wait for all images to be generated with error handling
    const results = await Promise.allSettled(imagePromises)

    // Filter successful results and handle errors
    const successfulImages = results
      .filter((result): result is PromiseFulfilledResult<{image: string, rarity: Rarity, prompt: string}> => 
        result.status === "fulfilled")
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
      images: successfulImages.map(item => item.image),
      rarities: successfulImages.map(item => item.rarity),
      prompts: successfulImages.map(item => item.prompt),
      totalRequested: prompts.length,
      totalGenerated: successfulImages.length,
    })
  } catch (error) {
    console.error("Error generating images:", error)
    return NextResponse.json({ error: "Failed to generate images" }, { status: 500 })
  }
}

// import { NextResponse } from "next/server"
// import fetch from "node-fetch"

// export async function POST(request: Request) {
//   try {
//     const { prompts } = await request.json()

//     if (!prompts || !Array.isArray(prompts) || prompts.length === 0) {
//       return NextResponse.json({ error: "Valid prompts array is required" }, { status: 400 })
//     }

//     // Generate images for each prompt
//     const imagePromises = prompts.map(async (prompt, index) => {
//       console.log(`Generating image ${index + 1}/${prompts.length} with prompt: ${prompt}`)

//       try {
//         const response = await fetch("https://anura-testnet.lilypad.tech/api/v1/image/generate", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${process.env.ANURA_API_KEY}`,
//           },
//           body: JSON.stringify({
//             prompt: `${prompt}, pixel art style, 8-bit graphics, detailed, vibrant colors`,
//             model: "sdxl-turbo",
//             // Add pixel art specific parameters
//             width: 512,
//             height: 512,
//             num_inference_steps: 30,
//             guidance_scale: 7.5,
//           }),
//         })

//         if (!response.ok) {
//           console.error(`Error response: ${response.status} ${response.statusText}`)
//           const errorText = await response.text()
//           console.error(`Error details: ${errorText}`)
//           throw new Error(`Error generating image: StatusCode: ${response.status}`)
//         }

//         // Convert the image to base64 for frontend display
//         const buffer = await response.arrayBuffer()
//         const base64Image = `data:image/png;base64,${Buffer.from(buffer).toString("base64")}`

//         return base64Image
//       } catch (error) {
//         console.error(`Error generating image for prompt ${index + 1}:`, error)
//         throw error
//       }
//     })

//     // Wait for all images to be generated with error handling
//     const results = await Promise.allSettled(imagePromises)

//     // Filter successful results and handle errors
//     const successfulImages = results
//       .filter((result): result is PromiseFulfilledResult<string> => result.status === "fulfilled")
//       .map((result) => result.value)

//     const errors = results
//       .filter((result): result is PromiseRejectedResult => result.status === "rejected")
//       .map((result) => result.reason)

//     if (errors.length > 0) {
//       console.error("Some images failed to generate:", errors)
//     }

//     if (successfulImages.length === 0) {
//       return NextResponse.json({ error: "Failed to generate any images" }, { status: 500 })
//     }

//     return NextResponse.json({
//       images: successfulImages,
//       totalRequested: prompts.length,
//       totalGenerated: successfulImages.length,
//     })
//   } catch (error) {
//     console.error("Error generating images:", error)
//     return NextResponse.json({ error: "Failed to generate images" }, { status: 500 })
//   }
// }
