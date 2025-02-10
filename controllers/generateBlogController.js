const expressAsyncHandler = require("express-async-handler");
const GeneratedContent = require("../models/generatedBlog");

exports.generateBlog = expressAsyncHandler(async (req, res) => {
  const { prompt } = req.body;

  const generatedContent = await generateResponse(prompt);
  const { description } = await generateImages(generatedContent.content);
  generatedContent.content = description;
  res.json({ generatedContent });
});

async function generateResponse(prompt) {
  const response = await fetch("https://api-inference.huggingface.co/models/google/gemma-2-2b-it", {
    headers: {
      Authorization: `Bearer ${process.env.HF_KEY}`,
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      inputs: `Write a blog post for Dev.to titled '${prompt}' using proper markdown formatting. Ensure the content flows well with appropriate headings and bullet points. Include up to 8 placeholder descriptions for images in the format [Image: placeholder], naturally integrating them into the content without making it look spammy. Do not use any other placeholders. Keep the writing engaging, structured for readability, and non-spammy.`,
    }),
  });

  let titleStartIndex;
  let titleEndIndex;
  let title;


  let descriptionContent;
  await response.json().then((data) => {
    titleStartIndex = data[0].generated_text.indexOf("##");
    titleEndIndex = data[0].generated_text.indexOf("\n", titleStartIndex + 1);
    title = data[0].generated_text.slice(titleStartIndex + 2, titleEndIndex);

    descriptionContent = data[0].generated_text.slice(titleEndIndex + 1);
  });

  return new GeneratedContent(title, descriptionContent);
}

async function generateImages(description) {
  const imagePlaceholders = description.match(/\[Image: .*?\]/g);
  for (const placeholder of imagePlaceholders) {
    const query = placeholder.replace("[Image: ", "").replace("]", "");
    const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1`, {
      headers: {
        Authorization: `Client-ID ${process.env.UNSPLASH_KEY}`,
      },
    });
    const data = await response.json();
    if (data.results.length > 0) {
      const image = data.results[0];
      description = description.replace(placeholder, `![${image.alt_description}](${image.urls.regular})`);
    }
  }
  return { description };
}
