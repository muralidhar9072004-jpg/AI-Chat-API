import express from "express";
import dotenv from "dotenv";
import { apiKeyManager } from "./apiKeyManager.js";
import mongoose, { model } from "mongoose";
import cors from "cors";



dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// mongoose.connect("mongodb://localhost:27017/chatdb")
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("mongo connected"))
    .catch(err => console.log(err));



const sessionSchema = new mongoose.Schema({
    userId: String,
    history: [String],
    summary: String,
    message: String,
    createdAt: { type: Date, default: Date.now }
})

const Session = mongoose.model("Session", sessionSchema);
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


async function updatesummary(usersessions) {
    const genAI = apiKeyManager.getGenAI();
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
    });

    const prompt =
        `
    you are a summarizer.

    current summary:${usersessions.summary}.

    recent conversation:
    ${usersessions.history.slice(-6).join("\n")}
    update the summary.
    keep important topics,goals,decisions,preferences.
    keep it concise.

    new summary:
    `;


    const result = await model.generateContent(prompt);
    return await result.response.text();
}


app.post("/chat", async (req, res) => {
    try {
        const { userId, message } = req.body;
        let usersessions = await Session.findOne({ userId });

        if (!usersessions) {

            usersessions = new Session({
                userId,
                history: [],
                summary: ""
            })
        }
        if (usersessions.history.length > 0 && usersessions.history.length % 12 === 0) {
            try {
                usersessions.summary = await updatesummary(usersessions);
            } catch (e) {
                console.log("Summary skipped");
            }
        }



        const lower = message.toLowerCase();

        if (
            lower.includes("earlier") ||
            lower.includes("summary") ||
            lower.includes("discuss") ||
            lower.includes("before")
        ) {
            return res.json({
                reply: usersessions.summary || "We recently discussed a few topics in our chat."
            });
        }

        usersessions.history.push(`User:${message}`);
        const now = new Date();

        const prompt = `
        You are a helpful, accurate AI assistant.

        Current date and time: ${now.toString()}

        Use the conversation history only as context.
        Answer the user's latest question directly and clearly.
        If asked about future/unreleased products, mention that official details may not be confirmed and discuss rumors/general expectations.

        Conversation summary:
        ${usersessions.summary}

        Recent conversation:
        ${usersessions.history.slice(-4).join("\n")}

        Latest user message:
        ${message}

        Final answer:
        `;



        const genAI = apiKeyManager.getGenAI();
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",

        });




        const result = await model.generateContent(prompt);
        const reply = await result.response.text();
        usersessions.history.push(`Ai:${reply}`);
        await usersessions.save();

        res.json({ reply })
    }
    catch (error) {
        console.error("\n[AI Error]:", error);
        res.status(500).json({ error: "Failed to get response from AI", details: error.message });
    }
});

app.post("/clear-chat", async (req, res) => {
    try {
        const { userId } = req.body;
        await Session.deleteOne({ userId });
        res.json({ message: "chat cleared" });

    }
    catch (error) {
        res.status(500).json({ error: error.message });

    }

});

app.get("/history/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const usersessions = await Session.findOne({ userId });

        if (!usersessions) {
            return res.json({
                history: [],
                summary: ""
            });
        }
        res.json({
            history: usersessions.history,
            summary: usersessions.summary
        })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});