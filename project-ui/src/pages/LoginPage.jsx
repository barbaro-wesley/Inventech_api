// src/pages/LoginPage.jsx
import FormLogin from "../forms/FormLogin";
import Logo from "../assets/HCR_Marca.png";

import "../styles/LoginPage.css";

function LoginPage() {
  return (
    <div className="login-page">
      <div className="left-panel">
        <img src={Logo} alt="Logo" className="logo" />
        <h1>Bem-vindo ao Sistema</h1>
        <p>Acesse sua conta para continuar</p>
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
