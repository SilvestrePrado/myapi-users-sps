console.log("Cargando rutas...");

const { Router } = require("express");

const authModule = require("./auth");
console.log("auth:", authModule);

const users = require("./users");
console.log("users:", users);

const { generateToken, authenticateToken } = require("./auth");

const routes = Router();

routes.use(require("express").json()); 

routes.get("/", (req, res) => {
  res.send("Hello World!");
});

//  --- Ruta accesible: login
routes.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ error: "Autenticación Incorrecta, verifique sus credenciales!" });
  }

  const token = generateToken({ email: user.email, type: user.type });

  res.json({ token });
});

// a continuacion rutas protegidas 
//crear
routes.post("/users", authenticateToken, (req, res) => {
  const { name, email, password, type } = req.body;

  const exists = users.find(u => u.email === email);
  if (exists) {
    return res.status(400).json({ error: "Ya existe un usuario con ese email." });
  }

  const newUser = { name, email, password, type };
  users.push(newUser);

  res.status(201).json({ message: "Usuario creado exitosamente.", user: newUser });
});
//listar
routes.get("/users", authenticateToken, (req, res) => {
  res.json(users);
});
//update
routes.put("/users/:email", authenticateToken, (req, res) => {
  const { email } = req.params;
  const { name, password, type } = req.body;

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(404).json({ error: "Usuario no encontrado." });
  }

  if (name) user.name = name;
  if (password) user.password = password;
  if (type) user.type = type;

  res.json({ message: "Usuario actualizado.", user });
});
//eliminar
routes.delete("/users/:email", authenticateToken, (req, res) => {
  const { email } = req.params;

  const index = users.findIndex(u => u.email === email);
  if (index === -1) {
    return res.status(404).json({ error: "Usuario no encontrado." });
  }

  users.splice(index, 1);

  res.json({ message: "Usuario eliminado exitosamente." });
});

module.exports = routes; 
