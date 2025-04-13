import { NextResponse } from "next/server";
import fetch from "node-fetch";
import { AbortController } from "node-abort-controller";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: false,
  },
};

// Ensure the base directory exists
function ensureBaseDirectory() {
  const baseDir = path.join(process.cwd(), "public", "generated-images");
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }
  return baseDir;
}

// Create a theme directory with incremented name if it already exists
function createThemeDirectory(themeName: string) {
  const baseDir = ensureBaseDirectory();
  let themeDir = path.join(baseDir, themeName);
  let dirName = themeName;
  let counter = 2;
  
  // If the directory already exists, try with incremented numbers
  while (fs.existsSync(themeDir)) {
    dirName = `${themeName} ${counter}`;
    themeDir = path.join(baseDir, dirName);
    counter++;
  }
  
  // Create the directory
  fs.mkdirSync(themeDir, { recursive: true });
  console.log(`Created theme directory: ${themeDir}`);
  
  return {
    dirPath: themeDir,
    themeDirName: dirName
  };
}

// Helper function to generate a single image with proper timeout handling
async function generateSingleImage(prompt: string, themeDirPath: string, themeDirName: string, index: number, total: number) {
  console.log(`Generating image ${index + 1}/${total} with prompt: ${prompt}`);
  
  // Create abort controller without timeout to keep connection open as long as needed
  const controller = new AbortController();
  
  try {
    const response = await fetch("https://anura-testnet.lilypad.tech/api/v1/image/generate", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.LILYPAD_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: `${prompt}, pixel art style, 8-bit graphics, detailed, vibrant colors`,
        model: "sdxl-turbo",
        width: 512,
        height: 512,
        num_inference_steps: 30,
        guidance_scale: 7.5,
      }),
    });

    if (!response.ok) {
      console.error(`Error response: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`Error details: ${errorText}`);
      throw new Error(`Error generating image: StatusCode: ${response.status}`);
    }

    // Use buffer() method directly
    const buffer = await response.buffer();
    
    // Generate a clean filename from the prompt
    const cleanPrompt = prompt.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 50);
    const fileName = `${cleanPrompt}.png`;
    const filePath = path.join(themeDirPath, fileName);
    
    fs.writeFileSync(filePath, buffer);
    console.log(`Image saved to: ${filePath}`);
    
    // Also return the base64 for API response
    const base64Image = `data:image/png;base64,${buffer.toString("base64")}`;
    
    return {
      base64Image,
      filePath: `/generated-images/${themeDirName}/${fileName}`, // Path relative to public directory
      fileName
    };
  } catch (error) {
    console.error(`Error generating image for prompt ${index + 1}:`, error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const { prompts, theme } = await request.json();

    if (!prompts || !Array.isArray(prompts) || prompts.length === 0) {
      return NextResponse.json({ error: "Valid prompts array is required" }, { status: 400 });
    }
    
    // Use the provided theme name or default to "collection"
    const themeName = theme?.trim() || "collection";
    
    // Create theme directory
    const { dirPath: themeDirPath, themeDirName } = createThemeDirectory(themeName);

    // Process images sequentially instead of in parallel to reduce failures
    const images = [];
    const errors = [];

    for (let i = 0; i < prompts.length; i++) {
      try {
        const result = await generateSingleImage(prompts[i], themeDirPath, themeDirName, i, prompts.length);
        images.push({
          base64: result.base64Image,
          filepath: result.filePath,
          prompt: prompts[i],
          fileName: result.fileName
        });
      } catch (error) {
        errors.push({
          prompt: prompts[i],
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    if (errors.length > 0) {
      console.error("Some images failed to generate:", errors);
    }

    if (images.length === 0) {
      return NextResponse.json({ 
        error: "Failed to generate any images", 
        failedPrompts: errors 
      }, { status: 500 });
    }

    return NextResponse.json({
      theme: themeDirName,
      themeDirectory: `/generated-images/${themeDirName}`,
      images,
      totalRequested: prompts.length,
      totalGenerated: images.length,
      imagePaths: images.map(img => img.filepath), // Easy access to just the file paths
      failedPrompts: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error("Error generating images:", error);
    return NextResponse.json({ error: "Failed to generate images" }, { status: 500 });
  }
}