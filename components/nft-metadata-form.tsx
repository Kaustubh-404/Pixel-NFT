"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface NFTMetadataFormProps {
  imageUrl: string
  onSubmit: (metadata: any) => void
  isSubmitting: boolean
}

export function NFTMetadataForm({ imageUrl, onSubmit, isSubmitting }: NFTMetadataFormProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [attributes, setAttributes] = useState([{ trait_type: "", value: "" }])
  const { toast } = useToast()

  const handleAddAttribute = () => {
    setAttributes([...attributes, { trait_type: "", value: "" }])
  }

  const handleRemoveAttribute = (index: number) => {
    const newAttributes = [...attributes]
    newAttributes.splice(index, 1)
    setAttributes(newAttributes)
  }

  const handleAttributeChange = (index: number, field: "trait_type" | "value", value: string) => {
    const newAttributes = [...attributes]
    newAttributes[index][field] = value
    setAttributes(newAttributes)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Name is required",
        variant: "destructive",
      })
      return
    }

    // Filter out empty attributes
    const filteredAttributes = attributes.filter((attr) => attr.trait_type.trim() !== "" && attr.value.trim() !== "")

    const metadata = {
      name,
      description,
      image: imageUrl,
      attributes: filteredAttributes,
    }

    onSubmit(metadata)
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="NFT Name"
              className="bg-gray-800 border-gray-700"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your NFT..."
              className="bg-gray-800 border-gray-700 min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Attributes</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddAttribute} className="text-xs">
                Add Attribute
              </Button>
            </div>

            {attributes.map((attr, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={attr.trait_type}
                  onChange={(e) => handleAttributeChange(index, "trait_type", e.target.value)}
                  placeholder="Trait"
                  className="bg-gray-800 border-gray-700"
                />
                <Input
                  value={attr.value}
                  onChange={(e) => handleAttributeChange(index, "value", e.target.value)}
                  placeholder="Value"
                  className="bg-gray-800 border-gray-700"
                />
                {attributes.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveAttribute(index)}
                    className="h-10 w-10"
                  >
                    &times;
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-black font-pixel"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Save Metadata"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
