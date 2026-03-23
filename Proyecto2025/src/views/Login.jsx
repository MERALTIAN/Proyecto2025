import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const login = () => {
    localStorage.setItem("usuario", JSON.stringify({ nombre: "Admin" }));
    navigate("/");
  };

  return (
    <div>
      <h1>Login</h1>
      <button onClick={login}>Iniciar sesión</button>
    </div>
  );
}

export default Login;