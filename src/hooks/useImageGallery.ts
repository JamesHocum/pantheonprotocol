import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"

export interface GeneratedImage {
  id: string
  image_url: string
  prompt: string
  style: string
  created_at: string
}

export const useImageGallery = () => {
  const { user } = useAuth()
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchImages = useCallback(async () => {
    if (!user) {
      setImages([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from("image_generations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (fetchError) throw fetchError

      setImages(data || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch images"))
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchImages()
  }, [fetchImages])

  const uploadImage = async (
    imageBlob: Blob,
    prompt: string,
    style: string
  ): Promise<{ url: string | null; error: Error | null }> => {
    if (!user) return { url: null, error: new Error("Not authenticated") }

    try {
      const fileName = `${Date.now()}.png`
      const filePath = `${user.id}/${fileName}`

      // Upload to storage bucket
      const { error: uploadError } = await supabase.storage
        .from("generated-images")
        .upload(filePath, imageBlob, {
          contentType: "image/png",
          cacheControl: "3600",
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("generated-images")
        .getPublicUrl(filePath)

      const imageUrl = urlData.publicUrl

      // Save metadata to database
      const { error: insertError } = await supabase
        .from("image_generations")
        .insert({
          user_id: user.id,
          image_url: imageUrl,
          prompt,
          style,
        })

      if (insertError) throw insertError

      await fetchImages()
      return { url: imageUrl, error: null }
    } catch (err) {
      return { url: null, error: err instanceof Error ? err : new Error("Failed to upload image") }
    }
  }

  const saveImageUrl = async (
    imageUrl: string,
    prompt: string,
    style: string
  ): Promise<{ error: Error | null }> => {
    if (!user) return { error: new Error("Not authenticated") }

    try {
      const { error: insertError } = await supabase
        .from("image_generations")
        .insert({
          user_id: user.id,
          image_url: imageUrl,
          prompt,
          style,
        })

      if (insertError) throw insertError

      await fetchImages()
      return { error: null }
    } catch (err) {
      return { error: err instanceof Error ? err : new Error("Failed to save image") }
    }
  }

  const deleteImage = async (imageId: string): Promise<{ error: Error | null }> => {
    if (!user) return { error: new Error("Not authenticated") }

    try {
      const { error: deleteError } = await supabase
        .from("image_generations")
        .delete()
        .eq("id", imageId)
        .eq("user_id", user.id)

      if (deleteError) throw deleteError

      setImages(prev => prev.filter(img => img.id !== imageId))
      return { error: null }
    } catch (err) {
      return { error: err instanceof Error ? err : new Error("Failed to delete image") }
    }
  }

  return {
    images,
    loading,
    error,
    uploadImage,
    saveImageUrl,
    deleteImage,
    refetch: fetchImages,
  }
}
