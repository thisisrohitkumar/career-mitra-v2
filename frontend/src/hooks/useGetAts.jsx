// getAts.js
const getAts = async (url) => {
  try {
    const myHeaders = new Headers();
    myHeaders.append("apikey", "bsWmSR7u9uiSevxSn44piuXcQU9xfbAo");

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
    };

    const response = await fetch(`https://api.apilayer.com/resume_parser/url?url=${url}`, requestOptions);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to parse resume.");
    }

    let score = 20; // Base score for a starting point
    if (result.skills && result.skills.length >= 5) score += 30;
    if (result.experience && result.experience.length > 1) score += 30;
    if (result.education && result.education.length > 0) score += 20;

    // Improvement suggestions
    const suggestions = [];
    if (!result.skills || result.skills.length < 5) suggestions.push("Consider adding more relevant skills.");
    if (!result.experience || result.experience.length <= 1) suggestions.push("Add more work experience.");
    if (!result.education || result.education.length === 0) suggestions.push("Include educational background.");

    return { atsScore: score, suggestions };
  } catch (error) {
    console.error("Error fetching ATS score:", error);
    return { atsScore: null, error: error.message };
  }
};

export default getAts;
