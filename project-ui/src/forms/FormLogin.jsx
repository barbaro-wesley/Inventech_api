import { useState } from "react";
import "../styles/FormLogin.css"
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from "../assets/logo.png"
import icon from "../assets/favicon.png"
const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const { setIsLoggedIn } = useAuth();
    const navigate = useNavigate();
  const validateForm = () => {
    const newErrors = { email: "", password: "" };
    if (!email) newErrors.email = "Email é obrigatório";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email inválido";

    if (!password) newErrors.password = "Senha é obrigatória";
    else if (password.length < 2) newErrors.password = "Mínimo de 6 caracteres";

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("https://intranet.hcrmarau.com.br/api/usuarios/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, senha: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.erro || "Erro ao fazer login");
      } else {
        setIsLoggedIn(true);
        navigate('/app');
      }
    } catch (error) {
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo-wrapper">
          <img src={Logo} alt="Logo" />
        </div>
        <h1>Bem-vindo</h1>
        <p className="subtitle">Faça login para acessar sua conta</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Email</label>
            <div className="input-wrapper">
              
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {errors.email && <p className="error">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label>Senha</label>
            <div className="input-wrapper">
              
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                className="toggle-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
            {errors.password && <p className="error">{errors.password}</p>}
          </div>


          <button type="submit" className="submit-button">Entrar</button>

         
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
