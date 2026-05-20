# Studio

The Studio is the creative workbench. Three tabs:

## Code Canvas

A live JavaScript scratchpad (`src/components/features/CodeCanvas.tsx`). Edit on the left, results render on the right with hot re-evaluation. Useful for quick algorithm sketches, regex tests, crypto experiments, and walking students through code interactively.

## SDXL

`src/components/features/SDXLPanel.tsx` calls the `sdxl-generate` edge function, which proxies to Replicate.

- **Model selector:** SDXL 1.0 (high fidelity) or SDXL Lightning (4-step fast).
- **Prompt + negative prompt + steps + guidance.**
- **Gallery:** results persist in the `generated-images` bucket and are tracked in the `generated_images` table.
- **Fallback:** when Replicate returns 402 (credits exhausted) or errors, the panel automatically falls back to free Gemini image generation via `generate-image` so the user still gets an image.

Requires `REPLICATE_API_TOKEN` in Lovable Cloud Secrets.

## LoRA Trainer

`src/components/features/LoraTrainer.tsx` lets users fine-tune SDXL on their own images.

1. Upload a ZIP of training images. The client uploads directly to the private `lora-datasets` bucket.
2. Configure `steps` (default 1000), `rank` (default 16), `learning_rate` (default 1e-4), and a trigger word.
3. The `lora-train` edge function generates a short-lived signed URL for the ZIP and POSTs it to Replicate's LoRA trainer.
4. Job state (queued → processing → succeeded/failed) is persisted in `lora_jobs` and polled by the UI.

Generated LoRA weights are returned as a Replicate model URL that can be plugged back into the SDXL panel as a `lora` parameter.

Requires `REPLICATE_API_TOKEN`.

## Image AI Studio (multi-modal)

Beyond SDXL, `ImageGeneration.tsx` also exposes Gemini Nano-Banana for fast/free generation, plus client-side HTML-Canvas resizing to keep uploads under 6 MB before sending to the gateway.
