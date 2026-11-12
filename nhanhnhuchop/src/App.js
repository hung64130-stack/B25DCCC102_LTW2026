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
        <Link to="/questions" style={{ marginRight: '15px' }}>Danh sách câu hỏi</Link>
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
    <div style={{ padding: '20px' }}>
      <h1>Trò chơi Nhanh như chớp</h1>
      <Link to="/questions">Xem Ngân hàng câu hỏi (Bài 1)</Link>
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
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;