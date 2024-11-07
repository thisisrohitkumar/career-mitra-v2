import React, { useState } from "react";
import "./resumeReview.css";
import loading from "../../../assets/loading.gif";
import useGetAtsScore from "@/hooks/useGetAtsScore";
import JsonDisplay from "@/components/JsonDisplay";

const ResumeReview = ({ url }) => {
  // const [parsedResumeData, setParsedResumeData] = useState(null);
  // const [showReview, setShowReview] = useState(false);
  // const [showLoading, setShowLoading] = useState(false);
  // const myHeaders = new Headers();
  // myHeaders.append("apikey", "8xxqwHuPurGA0HE90d69c49UyP9WkiEr");

  // const requestOptions = {
  //   method: "GET",
  //   redirect: "follow",
  //   headers: myHeaders,
  // };

  // const handleGenerateResumeReview = () => {
  //   setShowLoading(true);

  //   fetch(`https://api.apilayer.com/resume_parser/url?url=${url}`, requestOptions)
  //     .then((response) => response.json())
  //     .then((result) => {
  //       setParsedResumeData(result);
  //       setShowLoading(false);
  //       setShowReview(true);
  //     })
  //     .catch((error) => {
  //       console.log("resume error", error);
  //       setShowLoading(false);
  //     });
  // };

  const [showReview, setShowReview] = useState(false);
  const [showJsonDisplay, setShowJsonDisplay] = useState(false);
  const {
    parsedResumeData,
    atsScore,
    isLoading,
    error,
    improvementSuggestions,
  } = useGetAtsScore(showReview ? url : null);

  const handleGenerateResumeReview = () => {
    setShowReview(true);
  };

  const handleJsonDisplay = () => {
    setShowJsonDisplay(true);
  };

  return (
    <>
      <div className="resume__review__container max-w-4xl mx-auto bg-white rounded-2xl">
        <h1 className="font-bold text-lg my-5">Resume Review</h1>
        {/* <span>
          <button onClick={handleGenerateResumeReview}>Click here</button> to generate resume review
        </span>

        <div className={showLoading ? "show__loading" : "hide__loading"}>
          <img src={loading} alt="loading..." />
          <p>Reviewing your resume...</p>
        </div>

        {showReview && parsedResumeData && (
          <div className="show__review">
            <p className="ats__score">
              ATS Score: <b className="ats">84</b> <small className="remark">Good</small>
            </p>
            <p><b>Suggestions:</b></p>
            {!parsedResumeData.skills ? "Error parsing the resume" : "Nothing to suggest in your resume"}
          </div>
        )} */}

        <span>
          <button onClick={handleGenerateResumeReview}>
            Click here
          </button>
          to generate resume review
        </span>

        {isLoading && (
          <div className="show__loading">
            <img src={loading} alt="loading..." />
            <p>Reviewing your resume...</p>
          </div>
        )}

        {error && <p className="error">{error}</p>}

        {showReview && parsedResumeData && (
          <div className="show__review">
            <p className="ats__score">
              ATS Score: <b className="ats">{atsScore}</b>{" "}
              <small className="remark">
                {atsScore >= 85
                  ? "Excellent"
                  : atsScore >= 75
                  ? "Good"
                  : atsScore >= 50
                  ? "Needs Improvement"
                  : "Poor"}
              </small>
            </p>

            <h2 className="sugg">Suggestions for Improvement:</h2>
            {improvementSuggestions.length > 0 ? (
              <ul className="sugg__list">
                {improvementSuggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            ) : (
              <p>No improvement suggestions needed. Your resume looks good!</p>
            )}
            <div className="json__display">
              <span>
                <button onClick={handleJsonDisplay}>Click here</button> to see
                how ATS parse your resume
              </span>
              <JsonDisplay
                data={parsedResumeData}
                cl={
                  showJsonDisplay ? "show__json__display" : "hide__json__display"
                }
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ResumeReview;
