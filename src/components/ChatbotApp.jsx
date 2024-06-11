import React, { useState } from "react";

const ChatbotApp = () => {
  const [prompt, setPrompt] = useState("");
  const [apiResponse, setApiResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    let attempts = 0;

    const fetchCompletion = async () => {
      try {
        const response = await fetch("https://api.openai.com/v1/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            prompt: prompt,
            temperature: 0.5,
            max_tokens: 4000,
          }),
        });

        if (response.status === 429) {
          throw new Error("Rate limit exceeded");
        }

        const result = await response.json();
        console.log(result);
        console.log("response", result.choices[0].text);
        setApiResponse(result.choices[0].text);
      } catch (e) {
        if (e.message === "Rate limit exceeded" && attempts < 5) {
          attempts += 1;
          const delay = Math.pow(2, attempts) * 1000;
          console.log(`Rate limit hit, retrying in ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
          await fetchCompletion();
        } else {
          console.log(e);
          setApiResponse("Error - Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    await fetchCompletion();
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <form onSubmit={handleSubmit}>
          <textarea
            type="text"
            value={prompt}
            placeholder="Please ask to OpenAI"
            onChange={(e) => setPrompt(e.target.value)}
          ></textarea>
          <button disabled={loading || prompt.length === 0} type="submit">
            {loading ? "Generating..." : "Generate"}
          </button>
        </form>
      </div>
      {apiResponse && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <pre>
            <strong>API response:</strong>
            {apiResponse}
          </pre>
        </div>
      )}
    </>
  );
};

export default ChatbotApp;

