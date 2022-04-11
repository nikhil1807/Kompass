import './App.css';

function App() {
  return (
    <main>
    <header>
      <div class="navbar">
        <p class="navbar_heading">Kompass</p>
      </div>
    </header>

    <div class="container_main">
      <div id="container"></div>
    </div>
    <div class="button_div">
      <button id="start">Start</button>
    </div>
    <div class="hide">
      <span id="status"></span>
      <pre id="debug"></pre>
    </div>
    <div class="loader-wrapper">
      <span class="loader"><span class="loader-inner"></span></span>
    </div>
    </main>
  );
}

export default App;
