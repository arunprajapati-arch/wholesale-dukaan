"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Image from "next/image"
import { Loader2, PlusIcon, Upload, X } from "lucide-react"
import axios from "axios"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

const addProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  price: z.number().min(0.01, "Price must be greater than 0"),
  type: z.enum(["TSHIRT", "JEANS", "SHIRT", "OTHER"], {
    required_error: "Please select a product type",
  }),
  color: z.enum(["RED", "BLUE", "GREEN", "YELLOW", "PURPLE", "ORANGE", "PINK", "BROWN"], {
    required_error: "Please select a color",
  }),
})

type ProductFormData = z.infer<typeof addProductSchema>

export default function AddProductDialog() {
  const [open, setOpen] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<ProductFormData>({
    resolver: zodResolver(addProductSchema),
  })

  const onSubmit = async (data: ProductFormData) => {
    try {
      const payload = {
        ...data,
        image: imagePreview || "random.jpg", // Use uploaded image or default
      }

      const response = await axios.post("/api/createProduct", payload)
      console.log("response from add product", response)

      toast.success("Product added successfully!")
      reset()
      setImagePreview(null)
      setOpen(false)
    } catch (error) {
      console.error("Error adding product:", error)
      toast.error("Failed to add product")
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const clearImage = () => {
    setImagePreview(null)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div
          className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 bg-stone-50 rounded-md sm:rounded-lg font-semibold text-xs sm:text-sm transition-colors duration-200 shadow-sm cursor-pointer border border-stone-600"
        >
          <PlusIcon className="w-5 h-5 sm:w-4 sm:h-4" />
          <span className="text-xs sm:text-sm font-semibold hidden sm:inline">Product</span>
        </div>
      </DialogTrigger>
      <DialogContent className="max-h-[95vh] w-screen sm:max-h-[95vh] sm:w-[95vw] sm:max-w-[600px] md:max-w-[800px] lg:max-w-[1000px] xl:max-w-[1200px] overflow-hidden p-0">
        <div className="flex max-h-[95vh] sm:max-h-[95vh] flex-col">
          <DialogHeader className="px-4 pt-6 sm:px-6 lg:px-8">
            <DialogTitle className="text-lg sm:text-xl lg:text-2xl">Add New Product</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Fill in the details below to add a new product to your inventory.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8">
            <form onSubmit={handleSubmit(onSubmit)} id="add-product-form">
              <div className="grid gap-6 py-6 lg:grid-cols-5 lg:gap-8 xl:gap-12 items-center">
                {/* Left side - Image upload (takes 2 columns on large screens) */}
                <div className="flex flex-col items-center justify-start gap-4 lg:col-span-2">
                  <div className="relative flex h-48 w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-gray-400 hover:bg-gray-100 sm:h-64 md:h-72 lg:h-80 xl:h-96">
                    {imagePreview ? (
                      <>
                        <Image
                          src={imagePreview || "/placeholder.svg"}
                          alt="Product preview"
                          fill
                          className="rounded-lg object-contain p-3"
                        />
                        <button
                          type="button"
                          onClick={clearImage}
                          className="absolute right-3 top-3 z-10 rounded-full bg-white p-2 shadow-lg hover:bg-gray-100 transition-colors"
                          aria-label="Remove image"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center p-6">
                        <Upload className="mb-4 h-12 w-12 text-gray-400 sm:h-16 sm:w-16" />
                        <p className="mb-2 text-sm sm:text-base font-medium text-gray-700">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">SVG, PNG, JPG or GIF (Max. 2MB)</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 cursor-pointer opacity-0"
                      aria-label="Upload product image"
                    />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 text-center max-w-xs">
                    Upload a high-quality image to showcase your product. Recommended size: 800x800px
                  </p>
                </div>

                {/* Right side - Product details (takes 3 columns on large screens) */}
                <div className="space-y-6 lg:col-span-3">
                  <div className="grid gap-3">
                    <Label htmlFor="name" className="text-sm font-medium sm:text-base">
                      Product Name *
                    </Label>
                    <Input
                      id="name"
                      {...register("name")}
                      placeholder="Enter product name"
                      className="h-11 text-base"
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor="description" className="text-sm font-medium sm:text-base">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      {...register("description")}
                      placeholder="Describe your product in detail..."
                      className="min-h-[100px] sm:min-h-[120px] lg:min-h-[140px] text-base resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6">
                    <div className="grid gap-3">
                      <Label htmlFor="price" className="text-sm font-medium sm:text-base">
                        Price (&#8377;) *
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        {...register("price", { valueAsNumber: true })}
                        placeholder="0.00"
                        className="h-11 text-base"
                      />
                      {errors.price && (
                        <p className="text-sm text-red-600">{errors.price.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 lg:gap-6">
                    <div className="grid gap-3">
                      <Label htmlFor="type" className="text-sm font-medium sm:text-base">
                        Type *
                      </Label>
                      <Select onValueChange={(value) => setValue("type", value as "TSHIRT" | "JEANS" | "SHIRT" | "OTHER")}>
                        <SelectTrigger id="type" className="h-11 text-base">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TSHIRT">T-shirt</SelectItem>
                          <SelectItem value="JEANS">Jeans</SelectItem>
                          <SelectItem value="SHIRT">Shirt</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.type && (
                        <p className="text-sm text-red-600">{errors.type.message}</p>
                      )}
                    </div>

                    <div className="grid gap-3">
                      <Label htmlFor="color" className="text-sm font-medium sm:text-base">
                        Color *
                      </Label>
                      <Select onValueChange={(value) => setValue("color", value as "RED" | "BLUE" | "GREEN" | "YELLOW" | "PURPLE" | "ORANGE" | "PINK" | "BROWN")}>
                        <SelectTrigger id="color" className="h-11 text-base">
                          <SelectValue placeholder="Select color" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RED">Red</SelectItem>
                          <SelectItem value="BLUE">Blue</SelectItem>
                          <SelectItem value="GREEN">Green</SelectItem>
                          <SelectItem value="YELLOW">Yellow</SelectItem>
                          <SelectItem value="PURPLE">Purple</SelectItem>
                          <SelectItem value="ORANGE">Orange</SelectItem>
                          <SelectItem value="PINK">Pink</SelectItem>
                          <SelectItem value="BROWN">Brown</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.color && (
                        <p className="text-sm text-red-600">{errors.color.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <DialogFooter className="px-4 pb-6 pt-4 border-t bg-gray-50/50 sm:px-6 lg:px-8">
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-end sm:gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="w-full sm:w-auto h-11 text-base font-medium"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto h-11 text-base font-medium bg-red-900 hover:bg-red-800"
                form="add-product-form"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Product"}
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
