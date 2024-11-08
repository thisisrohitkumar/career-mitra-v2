import { useState, useEffect } from "react";

const useGetAtsScore = (url) => {
  const [parsedResumeData, setParsedResumeData] = useState(null);
  const [atsScore, setAtsScore] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [improvementSuggestions, setImprovementSuggestions] = useState([]);

  useEffect(() => {
    if (!url) return;

    const fetchResumeData = async () => {
      setIsLoading(true);
      try {
        const myHeaders = new Headers();
        myHeaders.append("apikey", "bsWmSR7u9uiSevxSn44piuXcQU9xfbAo");

        const requestOptions = {
          method: "GET",
          headers: myHeaders,
        };

        const response = await fetch(`https://api.apilayer.com/resume_parser/url?url=${url}`, requestOptions);
        const result = await response.json();

        if (response.ok) {
          setParsedResumeData(result);

          // Calculate a mock ATS score based on resume completeness
          let score = 20; // Base score

          // Example checks (you can customize these)
          if (result.skills && result.skills.length >= 5) score += 30;
          if (result.experience && result.experience.length > 1) score += 30;
          if (result.education && result.education.length > 0) score += 20;

          setAtsScore(score);

          // Generate improvement suggestions
          const suggestions = [];
          if (!result.skills || result.skills.length < 5) {
            suggestions.push("Consider adding more relevant skills.");
          }
          if (!result.experience || result.experience.length <= 1) {
            suggestions.push("Add more work experience details to improve ATS score.");
          }
          if (!result.education || result.education.length === 0) {
            suggestions.push("Include your educational background for a better score.");
          }
          setImprovementSuggestions(suggestions);
        } else {
          setError(result.message || "Failed to parse resume.");
        }
      } catch (error) {
        setError("Error fetching resume data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchResumeData();
  }, [url]);

  return { parsedResumeData, atsScore, isLoading, error, improvementSuggestions };
};

export default useGetAtsScore;
