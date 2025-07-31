// src/pages/LoginPage.jsx
import FormLogin from "../forms/FormLogin";
import Logo from "../assets/HCR_Marca.png";

import "../styles/LoginPage.css";

function LoginPage() {
  return (
    <div className="login-page">
      <div className="left-panel">
        <img src={Logo} alt="Logo" className="logo" />
        <h1>InvenTech</h1>
        <p>Controle total sobre computadores, impressoras, equipamentos médicos e manutenções. Tudo em uma plataforma moderna e intuitiva.</p>
      </div>
      <div className="right-panel">
        <div className="form-wrapper">
          <FormLogin />
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
