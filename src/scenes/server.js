import OpenAI from "openai";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const openai = new OpenAI({
    apiKey: "sk-proj-fPyZS73c5Ve2BBVlpsF7T3BlbkFJmBlqC7sIA9bSGJuXWM7a"
});

const app = express();

app.use(bodyParser.json()); // Use bodyParser to parse JSON requests
app.use(cors()); // Enable CORS for all routes

app.post("/chatbot", async (req, res) => {
    const { prompt } = req.body;

    try {
        const completion = await openai.createCompletion({
            model: "gpt-3.5-turbo",
            max_tokens: 512,
            temperature: 0,
            prompt: prompt,
        });
        res.send(completion.data.choices[0].text);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("An error occurred while processing your request.");
    }
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});
