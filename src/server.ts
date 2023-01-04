import express from "express";
import connectToDatabase from "./utils/db";
import AuthRouter from "./routes/auth.route";
import UserRouter from "./routes/user.route";
import NoteRouter from "./routes/note.route";
import ExcerptRouter from "./routes/excerpt.route";

const app = express();
const PORT = process.env.PORT || 3001;

connectToDatabase();

app.use(express.json());
app.use("/api/auth", AuthRouter);
app.use("/api/users", UserRouter);
app.use("/api/notes", NoteRouter);
app.use("/api/excerpts", ExcerptRouter);

app.listen(PORT, () => console.log(`App running on http://localhost:${PORT}/`));
