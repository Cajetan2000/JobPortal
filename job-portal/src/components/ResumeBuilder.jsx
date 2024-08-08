
import React, { useState } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import './ResumeBuilder.css';

Modal.setAppElement('#root');

const ResumeBuilder = () => {
  const [cvFile, setCvFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [generatedScore, setGeneratedScore] = useState(null);
  const [improvementAreas, setImprovementAreas] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [scoreModalIsOpen, setScoreModalIsOpen] = useState(false);
  const [pdfPath, setPdfPath] = useState('');

  const handleFileChange = (e) => {
    setCvFile(e.target.files[0]);
  };

  const handleAnalyzeCV = async () => {
    const formData = new FormData();
    formData.append('cvFile', cvFile);
    formData.append('jobDescription', jobDescription);

    try {
      const response = await axios.post('http://localhost:5000/analyze-cv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const sanitizedScore = response.data.score;
      const sanitizedImprovementAreas = response.data.improvementAreas.replace(/[\\*#]/g, '');

      setGeneratedScore(sanitizedScore);
      setImprovementAreas(sanitizedImprovementAreas);
      setPdfPath(response.data.pdfPath);
      setScoreModalIsOpen(true);
    } catch (error) {
      console.error('Error generating score:', error);
    }
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const speech = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(speech);
    } else {
      alert('Text-to-Speech is not supported in your browser.');
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  return (
    <div>
      <input
        type="submit"
        value="Upload your resume"
        onClick={() => setModalIsOpen(true)}
        className="w-full block py-2 bg-blue rounded-sm text-white cursor-pointer font-semibold"
      />

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Resume Input Modal"
        className="modal"
        overlayClassName="modal-overlay"
      >
        <h2>Upload Your CV and Job Description</h2>
        <div className="modal-content">
          <label>
            Upload CV:
            <input type="file" onChange={handleFileChange} />
          </label>
          <label>
            Job Description:
            <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
          </label>
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={handleAnalyzeCV}>Analyze CV</button>
          <button className="btn" onClick={() => setModalIsOpen(false)}>Close</button>
        </div>
      </Modal>

      <Modal
        isOpen={scoreModalIsOpen}
        onRequestClose={() => setScoreModalIsOpen(false)}
        contentLabel="Generated Score Modal"
        className="modal modal-large"
        overlayClassName="modal-overlay"
      >
        <h2>CV Analysis Report</h2>
        <div className="modal-content scrollable-content">
          <p>Score: {generatedScore}</p>
          <h3>Improvement Areas:</h3>
          <pre className="improvement-areas">{improvementAreas}</pre>
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={() => window.open('http://localhost:5000/download-report')}>Download Report</button>
          <button className="btn" onClick={() => speak(`Score: ${generatedScore}. Improvement Areas: ${improvementAreas}`)}>Read Aloud</button>
          <button className="btn" onClick={stopSpeaking}>Stop</button>
          <button className="btn" onClick={() => setScoreModalIsOpen(false)}>Close</button>
        </div>
      </Modal>
    </div>
  );
};

export default ResumeBuilder;
