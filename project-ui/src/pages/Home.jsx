// src/pages/Home.jsx
import Navbar from "../componets/Navbar";
import "../styles/Home.css";

function Home() {
  return (
    <div className="home-page">
      <Navbar />
      <div className="home-content">
        <h1>Bem-vindo ao FIXLAB</h1>
        <p>Escolha uma opção no menu acima para começar.</p>
      </div>
    </div>
  );
}

export default Home;
