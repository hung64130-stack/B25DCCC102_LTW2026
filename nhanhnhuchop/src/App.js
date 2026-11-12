import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function QuestionsList() {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    axios.get('/data/questions.json')
      .then(res => setQuestions(res.data))
      .catch(err => console.error("Lỗi tải dữ liệu:", err));
  }, []);

  return (
    <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h2> Ngân hàng câu hỏi Nhanh như chớp</h2>
      <nav style={{ marginBottom: '20px', padding: '10px', background: '#f0f2f5', borderRadius: '5px' }}>
        <Link to="/play" style={{ marginRight: '20px', fontWeight: 'bold', color: '#007bff', textDecoration: 'none' }}> Bắt đầu chơi game</Link>
        <Link to="/" style={{ color: '#333', textDecoration: 'none' }}> Về trang chủ</Link>
      </nav>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {questions.map((q) => (
          <li key={q.id} style={{ marginBottom: '12px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', background: '#fff' }}>
            <Link to={`/questions/${q.id}`} style={{ textDecoration: 'none', color: '#333' }}>
              <strong>Câu {q.id}:</strong> {q.question} {q.reserve ? <span style={{ color: 'orange', fontSize: '12px' }}>(Dự bị)</span> : ""}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function QuestionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);

  useEffect(() => {
    axios.get('/data/questions.json')
      .then(res => {
        const found = res.data.find(q => q.id === parseInt(id));
        setQuestion(found);
      })
      .catch(err => console.error(err));
  }, [id]);

  if (!question) return <div style={{ padding: '30px', textAlign: 'center' }}>Đang tải hoặc không tìm thấy câu hỏi...</div>;

  return (
    <div style={{ padding: '30px', maxWidth: '600px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h2>🔍 Chi tiết câu hỏi #{question.id}</h2>
      <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{question.question}</p>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {question.options.map((opt, idx) => (
          <li key={idx} style={{ 
            padding: '10px', 
            marginBottom: '8px', 
            borderRadius: '5px',
            backgroundColor: idx === question.answer ? '#d4edda' : '#f8f9fa',
            color: idx === question.answer ? '#155724' : '#333',
            fontWeight: idx === question.answer ? 'bold' : 'normal' 
          }}>
            {String.fromCharCode(65 + idx)}. {opt} {idx === question.answer ? " (Đáp án đúng)" : ""}
          </li>
        ))}
      </ul>
      <p><strong>Mức độ:</strong> {question.level === 1 ? 'Dễ' : question.level === 2 ? 'Trung bình' : 'Khó'}</p>
      <p><strong>Giải thích:</strong> {question.explain}</p>
      <button onClick={() => navigate('/questions')} style={{ padding: '8px 16px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Quay lại danh sách</button>
    </div>
  );
}

function GamePlay() {
  const [playerName, setPlayerName] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [gameQuestions, setGameQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameOver, setGameOver] = useState(false);
  const [highScores, setHighScores] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedScores = JSON.parse(localStorage.getItem('nhanhnhuchop_leaderboard')) || [];
    setHighScores(savedScores);
    axios.get('/data/questions.json')
      .then(res => {
        const officialQuestions = res.data.filter(q => !q.reserve); 
        const shuffled = [...res.data].sort(() => 0.5 - Math.random());
        setGameQuestions(shuffled.slice(0, 15));
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (!isStarted || gameOver || gameQuestions.length === 0) return;

    if (timeLeft === 0) {
      handleNextQuestion();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, gameOver, isStarted, gameQuestions]);

  const handleStartGame = (e) => {
    e.preventDefault();
    if (!playerName.trim()) {
      alert('Vui lòng nhập tên của bạn trước khi chơi!');
      return;
    }
    setIsStarted(true);
  };

  const handleAnswer = (selectedIdx) => {
    const currentQ = gameQuestions[currentIndex];
    if (selectedIdx === currentQ.answer) {
      const earnedScore = 10 + timeLeft * 2;
      setScore(prev => prev + earnedScore);
    }
    handleNextQuestion();
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < gameQuestions.length) {
      setCurrentIndex(prev => prev + 1);
      setTimeLeft(15);
    } else {
      setGameOver(true);
      saveScoreToLeaderboard(score);
    }
  };

  const saveScoreToLeaderboard = (finalScore) => {
    const newRecord = { name: playerName, score: finalScore };
    const updatedScores = [...highScores, newRecord].sort((a, b) => b.score - a.score).slice(0, 5);
    setHighScores(updatedScores);
    localStorage.setItem('nhanhnhuchop_leaderboard', JSON.stringify(updatedScores));
  };

  if (!isStarted) {
    return (
      <div style={{ padding: '50px', maxWidth: '400px', margin: '60px auto', fontFamily: 'Arial, sans-serif', border: '1px solid #ddd', borderRadius: '8px', background: '#f9f9f9', textAlign: 'center' }}>
        <h2> Nhập thông tin người chơi</h2>
        <form onSubmit={handleStartGame} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
          <input 
            type="text" 
            placeholder="Nhập tên của bạn..." 
            value={playerName} 
            onChange={(e) => setPlayerName(e.target.value)}
            style={{ padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <button type="submit" style={{ padding: '10px', background: '#28a745', color: '#fff', fontSize: '16px', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Bắt đầu chơi</button>
        </form>
        <div style={{ marginTop: '20px' }}>
          <Link to="/" style={{ color: '#007bff', textDecoration: 'none' }}>⬅ Về trang chủ</Link>
        </div>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div style={{ padding: '30px', maxWidth: '600px', margin: '0 auto', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
        <h2> Kết quả trò chơi</h2>
        <p style={{ fontSize: '18px' }}>Người chơi: <strong style={{ color: '#007bff' }}>{playerName}</strong></p>
        <p style={{ fontSize: '22px' }}>Tổng điểm: <strong style={{ color: 'green' }}>{score}</strong></p>
        
        <h3 style={{ marginTop: '30px' }}> Bảng Kỷ Lục (Top Cao Thủ)</h3>
        <ul style={{ listStyleType: 'none', padding: 0, maxWidth: '400px', margin: '0 auto', border: '1px solid #ddd', borderRadius: '5px', background: '#fff' }}>
          {highScores.map((item, index) => (
            <li key={index} style={{ padding: '10px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
              <span>{index + 1}. <strong>{item.name}</strong></span>
              <span><strong>{item.score} điểm</strong></span>
            </li>
          ))}
        </ul>

        <div style={{ marginTop: '30px' }}>
          <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', marginRight: '10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Chơi lại</button>
          <button onClick={() => navigate('/questions')} style={{ padding: '10px 20px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Ngân hàng câu hỏi</button>
        </div>
      </div>
    );
  }

  const currentQ = gameQuestions[currentIndex];

  return (
    <div style={{ padding: '30px', maxWidth: '600px', margin: '0 auto', fontFamily: 'Arial, sans-serif', background: '#fdfdfd', border: '1px solid #eee', borderRadius: '8px', marginTop: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontWeight: 'bold' }}>
        <span>Người chơi: {playerName} | Câu {currentIndex + 1} / {gameQuestions.length}</span>
        <span style={{ color: 'red' }}> Thời gian: {timeLeft}s</span>
      </div>
      <p style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>{currentQ.question}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {currentQ.options.map((opt, idx) => (
          <button 
            key={idx} 
            onClick={() => handleAnswer(idx)}
            style={{ padding: '12px', textAlign: 'left', cursor: 'pointer', fontSize: '16px', border: '1px solid #ccc', borderRadius: '5px', background: '#fff' }}
          >
            {String.fromCharCode(65 + idx)}. {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div style={{ padding: '30px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
      <h2>404 - Không tìm thấy trang</h2>
      <p>Đường dẫn bạn truy cập không tồn tại.</p>
      <Link to="/questions">Đến Ngân hàng câu hỏi</Link>
    </div>
  );
}

function Home() {
  return (
    <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
      <h1> Trò chơi Nhanh Như Chớp </h1>
      <div style={{ marginTop: '30px' }}>
        <Link to="/play" style={{ padding: '12px 24px', background: '#28a745', color: '#fff', textDecoration: 'none', fontSize: '18px', fontWeight: 'bold', borderRadius: '5px', marginRight: '15px' }}> Bắt đầu chơi</Link>
        <Link to="/questions" style={{ padding: '12px 24px', background: '#007bff', color: '#fff', textDecoration: 'none', fontSize: '18px', fontWeight: 'bold', borderRadius: '5px' }}> Ngân hàng câu hỏi</Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/questions" element={<QuestionsList />} />
        <Route path="/questions/:id" element={<QuestionDetail />} />
        <Route path="/play" element={<GamePlay />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;