import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

class ApiKeyManager {
    constructor() {
        this.keys = [];
        // Load keys from environment variables GEMINI_API_KEY_1 to GEMINI_API_KEY_10
        for (let i = 1; i <= 10; i++) {
            const key = process.env[`GEMINI_API_KEY_${i}`];
            if (key) {
                this.keys.push(key);
            }
        }

        if (this.keys.length === 0) {
            console.error("No API keys found in .env! Please set GEMINI_API_KEY_1 to GEMINI_API_KEY_10.");
            // Fallback to legacy key if available
            if (process.env.GEMINI_API_KEY) {
                this.keys.push(process.env.GEMINI_API_KEY);
            }
        }

        this.instances = this.keys.map(key => new GoogleGenerativeAI(key));
        this.currentIndex = 0;
        this.requestCount = 0;
        this.maxRequestsPerKey = 3;

        console.log(`ApiKeyManager initialized with ${this.keys.length} keys.`);
    }

    getGenAI() {
        if (this.instances.length === 0) {
            throw new Error("No API keys available.");
        }

        const instance = this.instances[this.currentIndex];
        this.requestCount++;

        console.log(`Using API Key ${this.currentIndex + 1} (Request ${this.requestCount}/${this.maxRequestsPerKey})`);

        if (this.requestCount >= this.maxRequestsPerKey) {
            this.currentIndex = (this.currentIndex + 1) % this.instances.length;
            this.requestCount = 0;
            console.log(`Rotating to API Key ${this.currentIndex + 1} for next request.`);
        }

        return instance;
    }
}

export const apiKeyManager = new ApiKeyManager();
