import express, { Request, Response } from "express";
import AuthRouter from "routes/auth.route";
import UserRouter from "routes/user.route";

const app = express();
const PORT = process.env.PORT || 3001;

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Retain");
});

app.use("/api/auth", AuthRouter);
app.use("/api/user", UserRouter);

app.listen(PORT, () => console.log(`App running on http://localhost:${PORT}/`));
