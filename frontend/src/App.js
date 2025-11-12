// src/App.js
import './App.css';

function App() {
  const goToCloset = () => {
    window.location.href = process.env.PUBLIC_URL + '/closet.html';
  };

  return (
    <div className="App" style={{ textAlign: 'center', marginTop: '20%' }}>
      <h1>AI Closet Stylist</h1>
      <button onClick={goToCloset} className="go-btn">
        옷장으로 이동
      </button>
    </div>
  );
}

export default App;
