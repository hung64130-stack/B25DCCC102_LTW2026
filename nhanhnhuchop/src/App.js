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
    <div style={{ padding: '20px' }}>
      <h2>Ngân hàng câu hỏi Nhanh như chớp</h2>
      <nav style={{ marginBottom: '20px' }}>
        <Link to="/play" style={{ marginRight: '15px', fontWeight: 'bold', color: 'blue' }}>   Bắt đầu chơi game</Link>
        <Link to="/">Về trang chủ</Link>
      </nav>
      <ul>
        {questions.map((q) => (
          <li key={q.id} style={{ marginBottom: '10px' }}>
            <Link to={`/questions/${q.id}`}>
              Câu {q.id}: {q.question} {q.reserve ? "(Dự bị)" : ""}
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

  if (!question) return <div style={{ padding: '20px' }}>Đang tải hoặc không tìm thấy câu hỏi...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Chi tiết câu hỏi #{question.id}</h2>
      <p><strong>Nội dung:</strong> {question.question}</p>
      <ul>
        {question.options.map((opt, idx) => (
          <li key={idx} style={{ color: idx === question.answer ? 'green' : 'black', fontWeight: idx === question.answer ? 'bold' : 'normal' }}>
            {String.fromCharCode(65 + idx)}. {opt} {idx === question.answer ? "(Đáp án đúng)" : ""}
          </li>
        ))}
      </ul>
      <p><strong>Mức độ:</strong> {question.level === 1 ? 'Dễ' : question.level === 2 ? 'Trung bình' : 'Khó'}</p>
      <p><strong>Giải thích:</strong> {question.explain}</p>
      <button onClick={() => navigate('/questions')}>Quay lại danh sách</button>
    </div>
  );
}

function GamePlay() {
  const [gameQuestions, setGameQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameOver, setGameOver] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/data/questions.json')
      .then(res => {
        const shuffled = [...res.data].sort(() => 0.5 - Math.random());
        setGameQuestions(shuffled.slice(0, 5)); 
      })
      .catch(err => console.error(err));
  }, []);
  useEffect(() => {
    if (gameOver || gameQuestions.length === 0) return;

    if (timeLeft === 0) {
      handleNextQuestion();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, gameOver, gameQuestions]);

  const handleAnswer = (selectedIdx) => {
    const currentQ = gameQuestions[currentIndex];
    let earnedScore = 0;
    if (selectedIdx === currentQ.answer) {
      earnedScore = 10 + timeLeft * 2;
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
    }
  };

  if (gameQuestions.length === 0) return <div style={{ padding: '20px' }}>Đang tải câu hỏi trò chơi...</div>;

  if (gameOver) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Kết quả trò chơi</h2>
        <p style={{ fontSize: '20px' }}>Tổng điểm của bạn: <strong>{score}</strong></p>
        <button onClick={() => navigate('/questions')} style={{ padding: '10px 20px', marginRight: '10px' }}>Về Ngân hàng câu hỏi</button>
        <button onClick={() => window.location.reload()} style={{ padding: '10px 20px' }}>Chơi lại</button>
      </div>
    );
  }

  const currentQ = gameQuestions[currentIndex];

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Nhanh Như Chớp - Câu {currentIndex + 1} / {gameQuestions.length}</h2>
      <div style={{ color: 'red', fontWeight: 'bold', marginBottom: '15px' }}>⏱ Thời gian còn lại: {timeLeft}s</div>
      <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{currentQ.question}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {currentQ.options.map((opt, idx) => (
          <button 
            key={idx} 
            onClick={() => handleAnswer(idx)}
            style={{ padding: '10px', textAlign: 'left', cursor: 'pointer', fontSize: '16px' }}
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
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>404 - Không tìm thấy trang</h2>
      <p>Đường dẫn bạn truy cập không tồn tại.</p>
      <Link to="/questions">Đến Ngân hàng câu hỏi</Link>
    </div>
  );
}

function Home() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Trò chơi Nhanh Như Chớp</h1>
      <div style={{ marginTop: '20px' }}>
        <Link to="/play" style={{ fontSize: '18px', marginRight: '20px', fontWeight: 'bold' }}> Bắt đầu chơi</Link>
        <Link to="/questions" style={{ fontSize: '18px' }}> Ngân hàng câu hỏi</Link>
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