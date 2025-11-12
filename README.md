# AI Closet Stylist - React NavBar Guide

## 1. 작동 방식

React 기반으로 작성됨  

- public/index.html은 한 번만 로드되는 기본 HTML 템플릿  
- src/index.js에서 index.html의 <div id="root"></div>를 찾아 App.js 컴포넌트를 렌더링  
- 모든 페이지 화면은 App.js 내부의 React 컴포넌트로 구성됨  
- HTML이 아닌 JSX로 동적으로 생성  
- React는 가상 DOM을 사용하여 변경된 부분만 갱신함  
- 페이지 새로고침 없이 부드럽게 동작  

public/
┗ index.html ← 기본 HTML 템플릿 (root만 존재)
src/
┣ index.js ← React 진입점
┗ App.js ← 실제 UI 렌더링 컴포넌트
---

## 2. 코드 요약

아래 코드는 네브바만 표시되는 기본 버전으로, 다른 프로젝트에서도 복사해 바로 사용 가능함  

### src/App.js
```jsx
import './App.css';

function App() {
  return (
    <nav id="nav3">
      <a href="/">AI Closet</a>
      <ul>
        <li><a href="/">menu1</a></li>
        <li><a href="/">menu2</a></li>
        <li><a href="/">menu3</a></li>
        <li><a href="/">menu4</a></li>
        <li><a href="/">menu5</a></li>
      </ul>
      <select>
        <option>=test=</option>
        <option>=test=</option>
        <option>=test=</option>
      </select>
    </nav>
  );
}

export default App;

src/App.css
* { margin: 0; padding: 0; box-sizing: border-box; }
ul, ol { list-style: none; }
a { text-decoration: none; color: #ccc; font-size: 15px; transition: color .2s; }

html, body, #root {
  height: 100%;
  width: 100%;
}

body {
  padding-top: 60px;
  background: #f5f5f5;
  font-family: 'Noto Sans KR', sans-serif;
}

nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  width: 100%;
  height: 60px;
  background-color: #111;
  border-bottom: 1px solid #222;
  z-index: 1000;
  display: flex;
  align-items: center;
}

#nav3 {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #ccc;
}

#nav3 > a {
  font-size: 22px;
  font-weight: 800;
  color: #fff;
}

#nav3 > ul { display: flex; gap: 25px; }
#nav3 > ul li a { color: #ccc; }
#nav3 > ul li a:hover { color: #fff; border-bottom: 2px solid #fff; padding-bottom: 2px; }

#nav3 > select {
  padding: 3px 14px;
  background-color: #111;
  color: #ccc;
  border: 1px solid #333;
  border-radius: 20px;
  outline: none;
}
#nav3 > select:hover { border-color: #fff; color: #fff; }

3. 다른 페이지 적용 예시

다른 컴포넌트를 추가하거나 페이지를 분리할 때 사용 가능

src/pages/Home.js
function Home() {
  return (
    <div style={{ marginTop: '100px', textAlign: 'center' }}>
      <h2>홈 화면</h2>
      <p>AI Closet Stylist의 홈 페이지</p>
    </div>
  );
}

export default Home;

App.js에서 연결
import './App.css';
import Home from './pages/Home';

function App() {
  return (
    <>
      <nav id="nav3">
        <a href="/">AI Closet</a>
        <ul>
          <li><a href="/">menu1</a></li>
          <li><a href="/">menu2</a></li>
          <li><a href="/">menu3</a></li>
          <li><a href="/">menu4</a></li>
          <li><a href="/">menu5</a></li>
        </ul>
        <select>
          <option>=test=</option>
          <option>=test=</option>
          <option>=test=</option>
        </select>
      </nav>
      <Home />
    </>
  );
}

export default App;

