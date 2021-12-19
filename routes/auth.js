var express = require("express");
var router = express.Router();
const sqlite3 = require('sqlite3').verbose();

// 데이터베이스 연결
let db = new sqlite3.Database('./db/underpin.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
});

// 회원가입 입성!!!
router.get("/register", function (req, res, next) {
    const logined = req.session ? req.session.logined : false;
    res.render('register', { logined, alert: null });
});

// 회원가입!!!!!
router.post('/register', function (req, res, next) {
    const { user_name, user_email, user_id, user_password, user_password_check, user_nickname, user_phone } = req.body;
    const query = `insert into user(user_name, user_email, user_id, user_password, user_nickname, user_phone) values ('${user_name}', '${user_email}', '${user_id}', '${user_password}', '${user_nickname}','${user_phone}')`;
    
    if (user_password !== user_password_check) {
        const logined = req.session ? req.session.logined : false;
        res.render('register', { logined, alert: "비밀번호가 일치하지 않습니다." });
    } else {
        db.serialize();
        db.each(query);
    
        const greeting = "underpin의 회원이 되셨습니다! 로그인 후 underpin의 다양한 서비스를 이용해 보세요!";
        res.render("login", { logined: req.session.logined, greeting });
    }
});

// 로그인 페이지 입성!
router.get("/login", function (req, res, next) {
    const logined = req.session ? req.session.logined : false;
    const greeting = "로그인 후 underpin의 다양한 서비스를 이용해 보세요!";
    res.render("login", { logined, greeting });
});

// 로그인!!!
router.post('/login',function (req, res, next){
    const logined = req.session ? req.session.logined : false;
    const body = req.body;
    const id = body.id;
    const pw = body.pw;
    const query = `SELECT * FROM user WHERE user_id == '${id}'`
    db.serialize();
    db.each(query);
    db.get(query, [], (err, row) => {
        if (err) {
            throw err;
        }else if (row === undefined){
            console.log('아이디 없음');
            const greeting = "아이디가 존재하지 않습니다.";
            res.render("login", { logined, greeting });
        }else if(pw == row.user_password){
            console.log('로그인 성공')
            req.session.logined = true;
            req.session.nickname = row.user_nickname;
            req.session.user_id = id;
            req.session.pw = pw;
            console.log(id)
            console.log(req.session.user_id)
            res.render('index', { logined: req.session.logined });
        }else{
            console.log('로그인 실패');
            const greeting = "비밀번호가 일치하지 않습니다.";
            res.render("login", { logined, greeting });
        }
    });
});

// 로그아웃!!!
router.get('/logout', function (req, res, next) {
    req.session.destroy(function(err){
        res.redirect('/');
    });
});

module.exports = router;