import express, { Request, Response } from "express";

const app = express();
const PORT = process.env.PORT || 3001;

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Retain");
});

app.listen(PORT, () => console.log(`App running on http://localhost:${PORT}/`));
