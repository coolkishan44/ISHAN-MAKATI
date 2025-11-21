import { GoogleGenAI, Content, Part, FunctionDeclaration, Type } from "@google/genai";
import { Message, BotResponse, OrderData } from "../types";
import { MODEL_NAME } from "../constants";

// Initialize API
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Define the tool for the model
const createOrderTool: FunctionDeclaration = {
  name: "create_order_summary",
  description: "Call this function when the user wants to finalize their order or asks for a bill/total. It extracts the items, quantities, and prices.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      items: {
        type: Type.ARRAY,
        description: "List of items ordered",
        items: {
          type: Type.OBJECT,
          properties: {
            itemName: { type: Type.STRING, description: "Name of the product (e.g., Black Forest Cake)" },
            quantity: { type: Type.NUMBER, description: "Quantity ordered" },
            unitPrice: { type: Type.NUMBER, description: "Price per unit in Rupees" }
          },
          required: ["itemName", "quantity", "unitPrice"]
        }
      }
    },
    required: ["items"]
  }
};

export const generateBotResponse = async (
  history: Message[],
  currentInput: string,
  systemInstruction: string
): Promise<BotResponse> => {
  try {
    // Format history for Gemini
    const chatHistory: Content[] = history.slice(-10).map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text } as Part],
    }));

    const model = ai.models;
    
    const response = await model.generateContent({
      model: MODEL_NAME,
      contents: [
        ...chatHistory,
        { role: 'user', parts: [{ text: currentInput }] }
      ],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 300,
        tools: [{ functionDeclarations: [createOrderTool] }],
      },
    });

    // Check for Function Calls
    const functionCalls = response.candidates?.[0]?.content?.parts?.find(p => p.functionCall)?.functionCall;

    if (functionCalls) {
      if (functionCalls.name === 'create_order_summary') {
        const args = functionCalls.args as any;
        const items = args.items || [];
        
        // Calculate total safely
        const totalAmount = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
        
        const orderData: OrderData = {
          items: items,
          totalAmount: totalAmount
        };

        return {
          text: "I've prepared your bill summary. Please confirm your order below. 👇",
          order: orderData
        };
      }
    }

    // Default text response
    return {
      text: response.text || "I'm having trouble connecting right now. Please try again."
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return { text: "⚠️ Error generating response. Please check your API configuration." };
  }
};

export const generateBroadcastMessage = async (
  topic: string,
  targetAudience: string,
  tone: string
): Promise<string> => {
  try {
    const prompt = `Write a WhatsApp marketing broadcast message about: "${topic}".
    Target Audience: ${targetAudience}
    Tone: ${tone}
    
    Rules:
    1. Use formatting like *bold* for key points.
    2. Include relevant emojis.
    3. Include a clear Call to Action (CTA).
    4. Keep it under 100 words.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    return response.text || "Could not generate broadcast message.";
  } catch (error) {
    console.error("Gemini Broadcast Error:", error);
    return "Error generating broadcast.";
  }
};
