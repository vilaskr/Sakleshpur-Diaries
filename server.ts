import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";

const apiKey = "AIzaSyDoL2pyAWL-Tyy7XCeMxGPJPUgh9-EMTSk";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // API route for AI Trip Planner
  app.post("/api/ai-trip", async (req, res) => {
    try {
      const { prompt, contextData } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const ai = new GoogleGenAI({ apiKey });

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-preview",
        contents: `You are a Sakleshpur local travel guide expert.
        Given the following database of available places, stays, and food spots:
        ${contextData}
        
        The user wants: "${prompt}"
        
        Create a practical, beautifully structured itinerary. Use ONLY the places and stays from the database if they fit, otherwise you can suggest generic travel activities.
        Return JSON.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallAdvice: {
                type: Type.STRING,
                description: "A short, engaging opening paragraph advising the traveler."
              },
              days: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    day: { type: Type.INTEGER },
                    plan: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          time: { type: Type.STRING, description: "e.g. 09:00 AM" },
                          activity: { type: Type.STRING, description: "Short title of activity or place name" },
                          description: { type: Type.STRING, description: "Why do this, or what to do there." },
                          type: { type: Type.STRING, description: "Must be 'Place', 'Food', 'Stay', or 'Travel'" }
                        },
                        required: ["time", "activity", "description", "type"]
                      }
                    }
                  },
                  required: ["day", "plan"]
                }
              }
            },
            required: ["overallAdvice", "days"]
          }
        }
      });

      if (response.text !== undefined) {
        let parsed;
        try {
          parsed = JSON.parse(response.text);
        } catch (e) {
          return res.status(500).json({ error: "Invalid JSON from AI model" });
        }
        res.json(parsed);
      } else {
        res.status(500).json({ error: "Failed to generate plan." });
      }
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || "Something went wrong" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
