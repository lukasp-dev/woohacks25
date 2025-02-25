import { generateContent } from "../../services/gemini.js"; // adjust the path as needed
import {
  extractUrls,
  sendMultipleRequests,
} from "../../utils/extractPlacesQueriesUrls.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { review } = req.body;

  try {
    // Places API query Url generated by Gemini
    const rawQueryUrls = await generateContent(review);
    console.log("Gemini raw query return message:", rawQueryUrls);

    // Extract Urls from return text from Gemini
    const queryUrls = extractUrls(rawQueryUrls);
    console.log("Extracted Places Query Url(s):", queryUrls);

    // Send query to Places API
    const results = await sendMultipleRequests(queryUrls);
    console.log("Places API results:", JSON.stringify(results, null, 2));
    res.status(200).json({ results });
  } catch (error) {
    console.error("Error generating recommendations:", error);
    res.status(500).json({ error: "Failed to generate recommendations" });
  }
}
