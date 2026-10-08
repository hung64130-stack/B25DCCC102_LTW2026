import React, { useState } from 'react';

const StudentItem = ({ student, onDelete }) => {
  const { id, name, score, studentClass } = student;

  const getBadgeClass = (s) => {
    if (s >= 8) return 'badge-success';
    if (s < 5) return 'badge-danger';
    return 'badge-normal';
  };

  return (
    <tr>
      <td>{id}</td>
      <td>{name}</td>
      <td>
        <span className={getBadgeClass(score)}>{score}</span>
      </td>
      <td>{studentClass}</td>
      <td>
        <button onClick={() => onDelete(id)} className="btn-delete">Xóa</button>
      </td>
    </tr>
  );
};

const StudentList = ({ students, onDelete }) => {
  return (
    <div className="student-list-container">
      <h3>Danh sách sinh viên</h3>
      {students.length === 0 ? (
        <p>Không có sinh viên nào trong danh sách.</p>
      ) : (
        <table className="student-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Họ tên</th>
              <th>Điểm số</th>
              <th>Lớp</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <StudentItem key={student.id} student={student} onDelete={onDelete} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const App = () => {
  const [students, setStudents] = useState([
    { id: 1, name: 'Nguyễn Văn Anh', score: 8.5, studentClass: 'DCCVT1' },
    { id: 2, name: 'Trần Thị Bình', score: 4.5, studentClass: 'DCCVT2' },
    { id: 3, name: 'Lê Hoàng Cường', score: 7.0, studentClass: 'DCCVT1' }
  ]);

  const [name, setName] = useState('');
  const [score, setScore] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [error, setError] = useState('');

  const handleAddStudent = (e) => {
    e.preventDefault();

    if (!name.trim() || !score || !studentClass.trim()) {
      setError('Vui lòng điền đầy đủ tất cả các trường thông tin.');
      return;
    }

    const numericScore = parseFloat(score);
    if (isNaN(numericScore) || numericScore < 0 || numericScore > 10) {
      setError('Điểm số phải là số thực hợp lệ trong khoảng từ 0 đến 10.');
      return;
    }

    setError('');

    const newStudent = {
      id: Date.now(),
      name: name.trim(),
      score: numericScore,
      studentClass: studentClass.trim()
    };

    setStudents((prevStudents) => [...prevStudents, newStudent]);
    setName('');
    setScore('');
    setStudentClass('');
  };

  const handleDeleteStudent = (id) => {
    setStudents((prevStudents) => prevStudents.filter((student) => student.id !== id));
  };

  const filteredStudents = students.filter((student) => {
    if (filter === 'EXCELLENT') return student.score >= 8;
    if (filter === 'FAIL') return student.score < 5;
    return true;
  });

  const totalStudents = students.length;
  const averageScore = totalStudents > 0 
    ? (students.reduce((acc, student) => acc + student.score, 0) / totalStudents).toFixed(2) 
    : 0;

  return (
    <div className="app-container" style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Ứng dụng Quản lý Điểm Sinh viên</h2>

      <div className="stats-box" style={{ background: '#f4f4f4', padding: '15px', marginBottom: '20px', borderRadius: '5px' }}>
        <p><strong>Tổng số sinh viên:</strong> {totalStudents}</p>
        <p><strong>Điểm trung bình toàn lớp:</strong> {averageScore}</p>
      </div>

      <form onSubmit={handleAddStudent} style={{ marginBottom: '20px', background: '#fff', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
        <h3>Thêm sinh viên mới</h3>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div style={{ marginBottom: '10px' }}>
          <label>Họ tên: </label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Điểm số: </label>
          <input 
            type="number" 
            step="0.1" 
            value={score} 
            onChange={(e) => setScore(e.target.value)} 
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Lớp: </label>
          <input 
            type="text" 
            value={studentClass} 
            onChange={(e) => setStudentClass(e.target.value)} 
          />
        </div>
        <button type="submit">Thêm</button>
      </form>

      <div className="filter-buttons" style={{ marginBottom: '15px' }}>
        <button onClick={() => setFilter('ALL')} style={{ marginRight: '10px' }}>Tất cả</button>
        <button onClick={() => setFilter('EXCELLENT')} style={{ marginRight: '10px' }}>Giỏi (Điểm &gt;= 8)</button>
        <button onClick={() => setFilter('FAIL')}>Trượt (Điểm &lt; 5)</button>
      </div>

      <StudentList students={filteredStudents} onDelete={handleDeleteStudent} />
    </div>
  );
};

export default App;