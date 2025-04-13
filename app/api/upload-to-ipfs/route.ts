import { NextResponse } from "next/server";
import pinataSDK from "@pinata/sdk";

// Cache the Pinata client to avoid re-initializing on each request
let pinataClient: any = null;

// Initialize the Pinata client
function getPinataClient() {
  if (pinataClient) return pinataClient;
  
  const PINATA_API_KEY = process.env.PINATA_API_KEY;
  const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;

  if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
    throw new Error("Pinata API keys not found in environment variables");
  }

  pinataClient = new pinataSDK(PINATA_API_KEY, PINATA_SECRET_API_KEY);
  return pinataClient;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageData, fileName, isMetadata, metadata } = body;

    if (!imageData && !metadata) {
      return NextResponse.json(
        { error: "Either image data or metadata is required" },
        { status: 400 }
      );
    }

    const pinata = getPinataClient();

    // Handle file upload if imageData is provided
    if (imageData) {
      // For base64 encoded images
      const buffer = Buffer.from(
        imageData.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
      );
      
      const options = {
        pinataMetadata: {
          name: fileName || "nft-image.png",
        },
      };

      // Using the stream upload method
      const result = await pinata.pinFileToIPFS(buffer, options);
      
      return NextResponse.json({
        success: true,
        cid: result.IpfsHash,
        url: `ipfs://${result.IpfsHash}`,
      });
    }
    
    // Handle metadata upload
    if (isMetadata && metadata) {
      const result = await pinata.pinJSONToIPFS(metadata);
      
      return NextResponse.json({
        success: true,
        cid: result.IpfsHash,
        url: `ipfs://${result.IpfsHash}`,
      });
    }

    return NextResponse.json(
      { error: "Invalid request parameters" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    
    // Detailed error handling for production
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Unknown error occurred";
      
    return NextResponse.json(
      { 
        error: "Failed to upload to IPFS", 
        details: errorMessage 
      }, 
      { status: 500 }
    );
  }
}

// For batch uploads, implement a separate endpoint
// Define TypeScript interfaces for our data structures
interface UploadResult {
  fileName: string;
  success: boolean;
  cid?: string;
  url?: string;
  error?: string;
  metadata?: {
    cid?: string;
    url?: string;
    error?: string;
  };
}

export async function PUT(request: Request) {
  try {
    const { images, generateMetadata } = await request.json();
    
    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: "Images array is required" },
        { status: 400 }
      );
    }
    
    const pinata = getPinataClient();
    const results: UploadResult[] = [];
    
    // Process each image
    for (const image of images) {
      const { imageData, fileName } = image;
      
      if (!imageData) {
        results.push({
          fileName,
          error: "Image data is missing",
          success: false,
        });
        continue;
      }
      
      try {
        const buffer = Buffer.from(
          imageData.replace(/^data:image\/\w+;base64,/, ""),
          "base64"
        );
        
        const result = await pinata.pinFileToIPFS(buffer, {
          pinataMetadata: { name: fileName || "nft-image.png" },
        });
        
        results.push({
          fileName,
          success: true,
          cid: result.IpfsHash,
          url: `ipfs://${result.IpfsHash}`,
        });
      } catch (imageError) {
        results.push({
          fileName,
          error: imageError instanceof Error 
            ? imageError.message 
            : "Failed to upload image",
          success: false,
        });
      }
    }
    
    // Generate metadata for each successful upload if requested
    if (generateMetadata) {
      for (const result of results) {
        if (result.success) {
          try {
            const name = result.fileName.split('.')[0];
            const metadata = {
              name,
              description: `${name} NFT`,
              image: `ipfs://${result.cid}`,
            };
            
            const metadataResult = await pinata.pinJSONToIPFS(metadata);
            
            result.metadata = {
              cid: metadataResult.IpfsHash,
              url: `ipfs://${metadataResult.IpfsHash}`,
            };
          } catch (metadataError) {
            result.metadata = {
              error: metadataError instanceof Error 
                ? metadataError.message 
                : "Failed to upload metadata",
            };
          }
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Error processing batch upload:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to process batch upload",
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}