const { groq } = require("@ai-sdk/groq");

const { generateText } = require("ai");

const { text } = await generateText({
  model: groq("llama-3.3-70b-versatile"),
  prompt: "Write a vegetarian lasagna recipe for 4 people.",
});
