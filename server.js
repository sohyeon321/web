const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// DB 연결 설정
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "4656",
  database: "myweb"
});

db.connect(err => {
  if (err) return console.error("DB 연결 오류:", err);
  console.log("MariaDB 연결 성공!");
});

// 회원가입 API
app.post("/register", async (req, res) => {
  const { userid, email, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users (userid, email, password) VALUES (?, ?, ?)",
    [userid, email, hashed],
    (err) => {
      if (err) return res.json({ success: false, message: "회원가입 실패" });
      res.json({ success: true, message: "회원가입 성공" });
    }
  );
});

// 로그인 API (userid 기반)
app.post("/login", (req, res) => {
  const { userid, password } = req.body;

  db.query("SELECT * FROM users WHERE userid = ?", [userid], async (err, results) => {
    if (err) return res.json({ success: false, message: "오류" });
    if (results.length === 0)
      return res.json({ success: false, message: "존재하지 않는 아이디" });

    const user = results[0];

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.json({ success: false, message: "비밀번호 틀림" });

    return res.json({ success: true, message: "로그인 성공" });
  });
});

app.listen(3000, () => {
  console.log("서버 실행 중: http://localhost:3000");
});
