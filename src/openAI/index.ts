import axios from "axios";

export const generateChatGPTResponse = async (question: string) => {
  const data = JSON.stringify({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: question
      }
    ],
    temperature: 0.7
  });

  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api.openai.com/v1/chat/completions",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPEN_AI_API_KEY}`
    },
    data: data
  };

  console.log("data => ", data);
  console.log("config => ", config);

  const res = await axios.request(config);

  return res.data.choices[0].message.content;
};
