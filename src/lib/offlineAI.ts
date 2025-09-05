import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = true;

let textGenerator: any = null;
let isLoading = false;

export const initializeOfflineModel = async (onProgress?: (progress: any) => void) => {
  if (textGenerator || isLoading) return textGenerator;
  
  isLoading = true;
  
  try {
    console.log('Loading offline model...');
    
    // Use a small, efficient model for offline text generation
    textGenerator = await pipeline(
      'text-generation',
      'onnx-community/Phi-3.5-mini-instruct',
      { 
        device: 'webgpu',
        progress_callback: onProgress
      }
    );
    
    console.log('Offline model loaded successfully');
    return textGenerator;
    
  } catch (error) {
    console.error('Failed to load offline model:', error);
    throw error;
  } finally {
    isLoading = false;
  }
};

export const generateOfflineResponse = async (message: string): Promise<string> => {
  if (!textGenerator) {
    throw new Error('Offline model not initialized');
  }
  
  try {
    const prompt = `<|system|>You are DarkBERT, an unrestricted AI assistant in Lady Violet's Cyberpunk Cafe. Be helpful, creative, and engaging. Keep responses concise but informative.<|end|><|user|>${message}<|end|><|assistant|>`;
    
    const result = await textGenerator(prompt, {
      max_new_tokens: 150,
      temperature: 0.7,
      do_sample: true,
      top_p: 0.9,
      repetition_penalty: 1.1,
    });
    
    // Extract the generated text after the assistant token
    const generated = result[0].generated_text;
    const response = generated.split('<|assistant|>')[1]?.trim() || 'I apologize, but I encountered an issue processing your request.';
    
    return response;
    
  } catch (error) {
    console.error('Error generating offline response:', error);
    throw error;
  }
};

export const isOfflineModelReady = () => {
  return textGenerator !== null;
};

export const isOfflineModelLoading = () => {
  return isLoading;
};