import express, { Request, Response } from "express";
import cors from "cors";
import connectToDatabase from "./utils/db";
import AuthRouter from "./routes/auth.route";
import UserRouter from "./routes/user.route";
import NoteRouter from "./routes/note.route";
import ExcerptRouter from "./routes/excerpt.route";

const app = express();
const PORT = process.env.PORT || 3001;

connectToDatabase();

app.use(
  cors({
    origin: "http://localhost:3000",
    exposedHeaders: ["x-auth-token"],
  })
);
app.use(express.json());
app.get("/", (req: Request, res: Response) =>
  res.send("api.everyread.io/HOME")
);
app.use("/api/auth", AuthRouter);
app.use("/api/users", UserRouter);
app.use("/api/notes", NoteRouter);
app.use("/api/excerpts", ExcerptRouter);

app.listen(PORT, () => console.log(`App running on http://localhost:${PORT}/`));
